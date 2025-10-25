import { MenuItem } from "../entities/MenuItem.js";

export interface IMenuRepository {
  /**
   * Save a new or updated menu item
   */
  save(item: MenuItem): Promise<void>;

  /**
   * Find a menu item by ID
   */
  findById(id: string): Promise<MenuItem | null>;

  /**
   * Find all menu items for a category
   */
  findByCategoryId(categoryId: string): Promise<MenuItem[]>;

  /**
   * Find all menu items for a venue (through menu and categories)
   */
  findByVenueId(venueId: string, options?: {
    availableOnly?: boolean;
  }): Promise<MenuItem[]>;

  /**
   * Delete a menu item
   */
  delete(id: string): Promise<void>;

  /**
   * Update menu item availability
   */
  updateAvailability(id: string, isAvailable: boolean): Promise<void>;
}

