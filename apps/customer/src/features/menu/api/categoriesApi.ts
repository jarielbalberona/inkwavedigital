import { api } from "../../../lib/api";
import type { ApiResponse } from "../../order/types/order.types";

export interface MenuCategory {
  id: string;
  name: string;
  sortIndex: number;
  iconUrl?: string;
}

export const categoriesApi = {
  getCategories: async (venueId: string): Promise<MenuCategory[]> => {
    const response = await api.get<ApiResponse<{ categories: MenuCategory[] }>>(`/api/v1/menu/${venueId}/categories`);
    return response.data.categories;
  },
};
