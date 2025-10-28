import { MenuItem } from "../entities/MenuItem.js";
import { MenuCategory } from "../entities/MenuCategory.js";
import { ItemOption } from "../entities/ItemOption.js";
import { ItemOptionValue } from "../entities/ItemOptionValue.js";
import { Menu } from "../entities/Menu.js";

export interface IMenuRepository {
  // Menu management methods
  /**
   * Find a menu by ID
   */
  findMenuById(id: string): Promise<Menu | null>;

  /**
   * Find all menus for a venue
   */
  findMenusByVenueId(venueId: string): Promise<Menu[]>;

  /**
   * Find the active menu for a venue
   */
  findActiveMenuByVenueId(venueId: string): Promise<Menu | null>;

  /**
   * Save a new or updated menu
   */
  saveMenu(menu: Menu): Promise<void>;

  /**
   * Delete a menu (cascades to categories and items)
   */
  deleteMenu(id: string): Promise<void>;

  /**
   * Set a menu as active (deactivates other menus for the same venue)
   */
  setActiveMenu(menuId: string, venueId: string): Promise<void>;

  // Menu Item management methods
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

  // Category management methods
  /**
   * Find all categories for a venue
   */
  findCategoriesByVenueId(venueId: string): Promise<MenuCategory[]>;

  /**
   * Save a new or updated category
   */
  saveCategory(category: MenuCategory): Promise<void>;

  /**
   * Find a category by ID
   */
  findCategoryById(id: string): Promise<MenuCategory | null>;

  /**
   * Delete a category
   */
  deleteCategory(id: string): Promise<void>;

  // Item options management methods
  /**
   * Find all options for a menu item
   */
  findItemOptions(itemId: string): Promise<ItemOption[]>;

  /**
   * Find an option by ID
   */
  findItemOptionById(id: string): Promise<ItemOption | null>;

  /**
   * Save a new or updated item option
   */
  saveItemOption(option: ItemOption): Promise<void>;

  /**
   * Delete an item option (cascades to option values)
   */
  deleteItemOption(id: string): Promise<void>;

  /**
   * Find all values for an option
   */
  findOptionValues(optionId: string): Promise<ItemOptionValue[]>;

  /**
   * Find an option value by ID
   */
  findOptionValueById(id: string): Promise<ItemOptionValue | null>;

  /**
   * Save a new or updated option value
   */
  saveItemOptionValue(value: ItemOptionValue): Promise<void>;

  /**
   * Delete an option value
   */
  deleteItemOptionValue(id: string): Promise<void>;
}

