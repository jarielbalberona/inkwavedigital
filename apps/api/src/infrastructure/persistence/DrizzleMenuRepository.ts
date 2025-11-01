import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { menuItems, itemOptions, itemOptionValues, menus, menuCategories } from "@inkwave/db";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { MenuItem } from "../../domain/entities/MenuItem.js";
import { MenuCategory } from "../../domain/entities/MenuCategory.js";
import { ItemOption } from "../../domain/entities/ItemOption.js";
import { ItemOptionValue } from "../../domain/entities/ItemOptionValue.js";
import { Menu } from "../../domain/entities/Menu.js";
import type { MenuItemOption } from "../../domain/entities/MenuItem.js";
import { Money } from "../../domain/value-objects/Money.js";

@injectable()
export class DrizzleMenuRepository implements IMenuRepository {
  constructor(@inject("Database") private db: Database) {}

  // ========================================
  // Menu Management Methods
  // ========================================

  async findMenuById(id: string): Promise<Menu | null> {
    const result = await this.db.query.menus.findFirst({
      where: eq(menus.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapMenuToEntity(result);
  }

  async findMenusByVenueId(venueId: string): Promise<Menu[]> {
    const results = await this.db.query.menus.findMany({
      where: eq(menus.venueId, venueId),
      orderBy: (menus, { desc }) => [desc(menus.isActive), desc(menus.createdAt)],
    });

    return results.map((menu) => this.mapMenuToEntity(menu));
  }

  async findActiveMenuByVenueId(venueId: string): Promise<Menu | null> {
    const result = await this.db.query.menus.findFirst({
      where: (m, { eq, and }) => and(eq(m.venueId, venueId), eq(m.isActive, true)),
    });

    if (!result) {
      return null;
    }

    return this.mapMenuToEntity(result);
  }

  async saveMenu(menu: Menu): Promise<void> {
    const menuData = {
      id: menu.id,
      venueId: menu.venueId,
      name: menu.name,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };

    await this.db
      .insert(menus)
      .values(menuData)
      .onConflictDoUpdate({
        target: menus.id,
        set: {
          name: menuData.name,
          isActive: menuData.isActive,
          updatedAt: menuData.updatedAt,
        },
      });
  }

  async deleteMenu(id: string): Promise<void> {
    await this.db.delete(menus).where(eq(menus.id, id));
  }

  async setActiveMenu(menuId: string, venueId: string): Promise<void> {
    // First, deactivate all menus for this venue
    await this.db
      .update(menus)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(menus.venueId, venueId));

    // Then activate the specified menu
    await this.db
      .update(menus)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(menus.id, menuId));
  }

  private mapMenuToEntity(menuData: any): Menu {
    return Menu.restore({
      id: menuData.id,
      venueId: menuData.venueId,
      name: menuData.name,
      isActive: menuData.isActive,
      createdAt: new Date(menuData.createdAt),
      updatedAt: new Date(menuData.updatedAt),
    });
  }

  // ========================================
  // Menu Item Management Methods
  // ========================================

  async save(item: MenuItem): Promise<void> {
    const itemData = {
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price.toNumber().toString(),
      imageUrls: item.imageUrls,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    // Upsert menu item
    await this.db
      .insert(menuItems)
      .values(itemData)
      .onConflictDoUpdate({
        target: menuItems.id,
        set: {
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          imageUrls: itemData.imageUrls,
          isAvailable: itemData.isAvailable,
          updatedAt: itemData.updatedAt,
        },
      });

    // Delete and re-insert options
    await this.db.delete(itemOptions).where(eq(itemOptions.itemId, item.id));

    for (const option of item.options) {
      await this.db.insert(itemOptions).values({
        id: option.id,
        itemId: item.id,
        name: option.name,
        type: option.type,
        required: option.required,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (option.values.length > 0) {
        await this.db.insert(itemOptionValues).values(
          option.values.map((value) => ({
            id: value.id,
            optionId: option.id,
            label: value.label,
            priceDelta: value.priceDelta.toNumber().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
      }
    }
  }

  async findById(id: string): Promise<MenuItem | null> {
    // Use raw SQL query to handle both image_url and image_urls columns
    const client = (this.db as any).client;
    
    const results = await client`
      SELECT 
        id, 
        category_id as "categoryId", 
        name, 
        description, 
        price, 
        COALESCE(
          image_urls,
          CASE 
            WHEN image_url IS NOT NULL AND image_url != '' 
            THEN jsonb_build_array(image_url)
            ELSE '[]'::jsonb
          END
        ) as image_urls,
        is_available as "isAvailable",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM menu_items
      WHERE id = ${id}
      LIMIT 1
    `;

    if (results.length === 0) {
      return null;
    }

    const item = results[0];
    const options = await this.fetchItemOptions(item.id);
    const imageUrls = Array.isArray(item.image_urls) 
      ? item.image_urls 
      : (typeof item.image_urls === 'string' ? [item.image_urls] : []);
    return this.mapToEntity({ ...item, imageUrls }, options);
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    // Use raw SQL query that handles both image_url and image_urls columns
    // This supports the migration period where the schema is being updated
    // Access the underlying postgres client from drizzle
    const client = (this.db as any).client;
    
    const rawResults = await client`
      SELECT 
        id, 
        category_id as "categoryId", 
        name, 
        description, 
        price, 
        COALESCE(
          image_urls,
          CASE 
            WHEN image_url IS NOT NULL AND image_url != '' 
            THEN jsonb_build_array(image_url)
            ELSE '[]'::jsonb
          END
        ) as image_urls,
        is_available as "isAvailable",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM menu_items
      WHERE category_id = ${categoryId}
    `;

    return Promise.all(
      rawResults.map(async (item: any) => {
        const options = await this.fetchItemOptions(item.id);
        // Ensure imageUrls is always an array
        const imageUrls = Array.isArray(item.image_urls) 
          ? item.image_urls 
          : (typeof item.image_urls === 'string' ? [item.image_urls] : []);
        return this.mapToEntity({ ...item, imageUrls }, options);
      })
    );
  }

  async findByVenueId(
    venueId: string,
    options?: { availableOnly?: boolean }
  ): Promise<MenuItem[]> {
    // Get only the active menu for this venue
    const activeMenu = await this.findActiveMenuByVenueId(venueId);

    if (!activeMenu) {
      return [];
    }
    
    // Get all categories for the active menu
    const categories = await this.db.query.menuCategories.findMany({
      where: eq(menuCategories.menuId, activeMenu.id),
    });

    if (categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map(cat => cat.id);

    // Get all menu items for these categories using raw SQL to handle both image_url and image_urls
    const client = (this.db as any).client;
    
    // Build the query with conditional available filter
    if (options?.availableOnly) {
      const rawResults = await client`
        SELECT 
          id, 
          category_id as "categoryId", 
          name, 
          description, 
          price, 
          COALESCE(
            image_urls,
            CASE 
              WHEN image_url IS NOT NULL AND image_url != '' 
              THEN jsonb_build_array(image_url)
              ELSE '[]'::jsonb
            END
          ) as image_urls,
          is_available as "isAvailable",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM menu_items
        WHERE category_id = ANY(${categoryIds})
        AND is_available = true
      `;
      
      return Promise.all(
        rawResults.map(async (item: any) => {
          const itemOptions = await this.fetchItemOptions(item.id);
          const imageUrls = Array.isArray(item.image_urls) 
            ? item.image_urls 
            : (typeof item.image_urls === 'string' ? [item.image_urls] : []);
          return this.mapToEntity({ ...item, imageUrls }, itemOptions);
        })
      );
    } else {
      const rawResults = await client`
        SELECT 
          id, 
          category_id as "categoryId", 
          name, 
          description, 
          price, 
          COALESCE(
            image_urls,
            CASE 
              WHEN image_url IS NOT NULL AND image_url != '' 
              THEN jsonb_build_array(image_url)
              ELSE '[]'::jsonb
            END
          ) as image_urls,
          is_available as "isAvailable",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM menu_items
        WHERE category_id = ANY(${categoryIds})
      `;
      
      return Promise.all(
        rawResults.map(async (item: any) => {
          const itemOptions = await this.fetchItemOptions(item.id);
          const imageUrls = Array.isArray(item.image_urls) 
            ? item.image_urls 
            : (typeof item.image_urls === 'string' ? [item.image_urls] : []);
          return this.mapToEntity({ ...item, imageUrls }, itemOptions);
        })
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<void> {
    await this.db
      .update(menuItems)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(menuItems.id, id));
  }

  private async fetchItemOptions(itemId: string): Promise<MenuItemOption[]> {
    const options = await this.db.query.itemOptions.findMany({
      where: eq(itemOptions.itemId, itemId),
    });

    return Promise.all(
      options.map(async (option) => {
        const values = await this.db.query.itemOptionValues.findMany({
          where: eq(itemOptionValues.optionId, option.id),
        });

        return {
          id: option.id,
          name: option.name,
          type: option.type as "select" | "multi",
          required: option.required,
          values: values.map((value) => ({
            id: value.id,
            label: value.label,
            priceDelta: Money.fromAmount(parseFloat(value.priceDelta)),
          })),
        };
      })
    );
  }

  private mapToEntity(itemData: any, options: MenuItemOption[]): MenuItem {
    return MenuItem.restore({
      id: itemData.id,
      categoryId: itemData.categoryId,
      name: itemData.name,
      description: itemData.description || undefined,
      price: Money.fromAmount(parseFloat(itemData.price)),
      imageUrls: Array.isArray(itemData.imageUrls) ? itemData.imageUrls : [],
      isAvailable: itemData.isAvailable,
      options,
      createdAt: new Date(itemData.createdAt),
      updatedAt: new Date(itemData.updatedAt),
    });
  }

  // Category management methods
  async findCategoriesByVenueId(venueId: string): Promise<MenuCategory[]> {
    // Get only the active menu for this venue
    const activeMenu = await this.findActiveMenuByVenueId(venueId);

    if (!activeMenu) {
      return [];
    }
    
    // Get all categories for the active menu
    const categories = await this.db.query.menuCategories.findMany({
      where: eq(menuCategories.menuId, activeMenu.id),
      orderBy: (cats, { asc }) => asc(cats.sortIndex),
    });

    return categories.map(category => this.mapCategoryToEntity(category));
  }

  async saveCategory(category: MenuCategory): Promise<void> {
    const categoryData = {
      id: category.id,
      menuId: category.menuId,
      name: category.name,
      sortIndex: category.sortIndex,
      iconUrl: category.iconUrl,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    await this.db
      .insert(menuCategories)
      .values(categoryData)
      .onConflictDoUpdate({
        target: menuCategories.id,
        set: {
          name: categoryData.name,
          sortIndex: categoryData.sortIndex,
          iconUrl: categoryData.iconUrl,
          updatedAt: categoryData.updatedAt,
        },
      });
  }

  async findCategoryById(id: string): Promise<MenuCategory | null> {
    const result = await this.db.query.menuCategories.findFirst({
      where: eq(menuCategories.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapCategoryToEntity(result);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.db.delete(menuCategories).where(eq(menuCategories.id, id));
  }

  private mapCategoryToEntity(categoryData: any): MenuCategory {
    return MenuCategory.restore({
      id: categoryData.id,
      menuId: categoryData.menuId,
      name: categoryData.name,
      sortIndex: categoryData.sortIndex,
      iconUrl: categoryData.iconUrl || undefined,
      createdAt: new Date(categoryData.createdAt),
      updatedAt: new Date(categoryData.updatedAt),
    });
  }

  // Item Options Management
  async findItemOptions(itemId: string): Promise<ItemOption[]> {
    const results = await this.db.query.itemOptions.findMany({
      where: eq(itemOptions.itemId, itemId),
    });

    return results.map((option) => this.mapOptionToEntity(option));
  }

  async findItemOptionById(id: string): Promise<ItemOption | null> {
    const result = await this.db.query.itemOptions.findFirst({
      where: eq(itemOptions.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapOptionToEntity(result);
  }

  async saveItemOption(option: ItemOption): Promise<void> {
    const optionData = {
      id: option.id,
      itemId: option.itemId,
      name: option.name,
      type: option.type,
      required: option.required,
      createdAt: option.createdAt,
      updatedAt: option.updatedAt,
    };

    await this.db
      .insert(itemOptions)
      .values(optionData)
      .onConflictDoUpdate({
        target: itemOptions.id,
        set: {
          name: optionData.name,
          type: optionData.type,
          required: optionData.required,
          updatedAt: optionData.updatedAt,
        },
      });
  }

  async deleteItemOption(id: string): Promise<void> {
    // Delete option values first (cascade)
    await this.db.delete(itemOptionValues).where(eq(itemOptionValues.optionId, id));
    // Delete option
    await this.db.delete(itemOptions).where(eq(itemOptions.id, id));
  }

  async findOptionValues(optionId: string): Promise<ItemOptionValue[]> {
    const results = await this.db.query.itemOptionValues.findMany({
      where: eq(itemOptionValues.optionId, optionId),
    });

    return results.map((value) => this.mapOptionValueToEntity(value));
  }

  async findOptionValueById(id: string): Promise<ItemOptionValue | null> {
    const result = await this.db.query.itemOptionValues.findFirst({
      where: eq(itemOptionValues.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapOptionValueToEntity(result);
  }

  async saveItemOptionValue(value: ItemOptionValue): Promise<void> {
    const valueData = {
      id: value.id,
      optionId: value.optionId,
      label: value.label,
      priceDelta: value.priceDelta.toString(),
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };

    await this.db
      .insert(itemOptionValues)
      .values(valueData)
      .onConflictDoUpdate({
        target: itemOptionValues.id,
        set: {
          label: valueData.label,
          priceDelta: valueData.priceDelta,
          updatedAt: valueData.updatedAt,
        },
      });
  }

  async deleteItemOptionValue(id: string): Promise<void> {
    await this.db.delete(itemOptionValues).where(eq(itemOptionValues.id, id));
  }

  private mapOptionToEntity(optionData: any): ItemOption {
    return ItemOption.restore({
      id: optionData.id,
      itemId: optionData.itemId,
      name: optionData.name,
      type: optionData.type as "select" | "multi",
      required: optionData.required,
      createdAt: new Date(optionData.createdAt),
      updatedAt: new Date(optionData.updatedAt),
    });
  }

  private mapOptionValueToEntity(valueData: any): ItemOptionValue {
    return ItemOptionValue.restore({
      id: valueData.id,
      optionId: valueData.optionId,
      label: valueData.label,
      priceDelta: parseFloat(valueData.priceDelta),
      createdAt: new Date(valueData.createdAt),
      updatedAt: new Date(valueData.updatedAt),
    });
  }
}

