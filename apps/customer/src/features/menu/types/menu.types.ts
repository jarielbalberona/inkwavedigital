export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  isAvailable: boolean;
  options: MenuItemOption[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: "select" | "multi";
  required: boolean;
  values: MenuItemOptionValue[];
}

export interface MenuItemOptionValue {
  id: string;
  label: string;
  priceDelta: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  iconUrl?: string;
  sortIndex: number;
}

export interface MenuResponse {
  items: MenuItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MenuQueryParams {
  venueId: string;
  availableOnly?: boolean;
}
