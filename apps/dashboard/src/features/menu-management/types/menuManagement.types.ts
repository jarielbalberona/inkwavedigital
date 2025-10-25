export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  sortIndex: number;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  options: MenuItemOption[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemOption {
  id: string;
  itemId: string;
  name: string;
  type: "select" | "multi";
  required: boolean;
  values: MenuItemOptionValue[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemOptionValue {
  id: string;
  optionId: string;
  label: string;
  priceDelta: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  menuId: string;
  name: string;
  sortIndex: number;
  iconUrl?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  sortIndex?: number;
  iconUrl?: string;
}

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface UpdateMenuItemInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface MenuManagementResponse {
  success: boolean;
  data: any;
}
