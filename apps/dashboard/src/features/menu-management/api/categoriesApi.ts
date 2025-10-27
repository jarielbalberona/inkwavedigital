import { api } from "../../../lib/api";
import type { MenuCategory, CreateCategoryInput, UpdateCategoryInput, ApiResponse } from "../types/menuManagement.types";

export const categoriesApi = {
  getCategories: async (venueId: string): Promise<MenuCategory[]> => {
    const response = await api.get<ApiResponse<{ categories: MenuCategory[] }>>(`/api/v1/menu/${venueId}/categories`);
    return response.data.categories;
  },
  
  createCategory: async (venueId: string, input: CreateCategoryInput): Promise<MenuCategory> => {
    const response = await api.post<ApiResponse<{ category: MenuCategory }>>(`/api/v1/menu/${venueId}/categories`, input);
    return response.data.category;
  },
  
  updateCategory: async (input: UpdateCategoryInput): Promise<MenuCategory> => {
    const response = await api.patch<ApiResponse<{ category: MenuCategory }>>(`/api/v1/menu/categories/${input.id}`, input);
    return response.data.category;
  },
  
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/v1/menu/categories/${id}`);
  },
};
