import { injectable, inject } from "tsyringe";
import { eq, and } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { menuItems, itemOptions, itemOptionValues, menus, menuCategories } from "@inkwave/db";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { MenuItem } from "../../domain/entities/MenuItem.js";
import { MenuCategory } from "../../domain/entities/MenuCategory.js";
import type { MenuItemOption, MenuItemOptionValue } from "../../domain/entities/MenuItem.js";
import { Money } from "../../domain/value-objects/Money.js";

@injectable()
export class DrizzleMenuRepository implements IMenuRepository {
  constructor(@inject("Database") private db: Database) {}

  async save(item: MenuItem): Promise<void> {
    const itemData = {
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price.toNumber().toString(),
      imageUrl: item.imageUrl,
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
          imageUrl: itemData.imageUrl,
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
    const result = await this.db.query.menuItems.findFirst({
      where: eq(menuItems.id, id),
    });

    if (!result) {
      return null;
    }

    const options = await this.fetchItemOptions(id);
    return this.mapToEntity(result, options);
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const results = await this.db.query.menuItems.findMany({
      where: eq(menuItems.categoryId, categoryId),
    });

    return Promise.all(
      results.map(async (item) => {
        const options = await this.fetchItemOptions(item.id);
        return this.mapToEntity(item, options);
      })
    );
  }

  async findByVenueId(
    venueId: string,
    options?: { availableOnly?: boolean }
  ): Promise<MenuItem[]> {
    // First, get all menu items for the venue
    // We need to find the menu for this venue, then get all categories, then all items
    const venueMenus = await this.db.query.menus.findMany({
      where: eq(menus.venueId, venueId),
    });

    if (venueMenus.length === 0) {
      return [];
    }

    const menuIds = venueMenus.map(menu => menu.id);
    
    // Get all categories for these menus
    const categories = await this.db.query.menuCategories.findMany({
      where: (cats, { inArray }) => inArray(cats.menuId, menuIds),
    });

    if (categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map(cat => cat.id);

    // Get all menu items for these categories
    const results = await this.db.query.menuItems.findMany({
      where: (items, { inArray, and, eq }) => {
        const conditions = [inArray(items.categoryId, categoryIds)];
        if (options?.availableOnly) {
          conditions.push(eq(items.isAvailable, true));
        }
        return and(...conditions);
      },
    });

    return Promise.all(
      results.map(async (item) => {
        const itemOptions = await this.fetchItemOptions(item.id);
        return this.mapToEntity(item, itemOptions);
      })
    );
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
      imageUrl: itemData.imageUrl || undefined,
      isAvailable: itemData.isAvailable,
      options,
      createdAt: new Date(itemData.createdAt),
      updatedAt: new Date(itemData.updatedAt),
    });
  }

  // Category management methods
  async findCategoriesByVenueId(venueId: string): Promise<MenuCategory[]> {
    // First, get all menus for this venue
    const venueMenus = await this.db.query.menus.findMany({
      where: eq(menus.venueId, venueId),
    });

    if (venueMenus.length === 0) {
      return [];
    }

    const menuIds = venueMenus.map(menu => menu.id);
    
    // Get all categories for these menus
    const categories = await this.db.query.menuCategories.findMany({
      where: (cats, { inArray }) => inArray(cats.menuId, menuIds),
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
}

