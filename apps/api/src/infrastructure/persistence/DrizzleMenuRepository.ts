import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { menuItems, itemOptions, itemOptionValues } from "@inkwave/db";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { MenuItem } from "../../domain/entities/MenuItem.js";
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
    // This would require joining through menus and categories
    // For now, return empty array - would need proper implementation
    return [];
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
}

