import { api } from "../../../lib/api";
import type { MenuCategory, CreateCategoryInput, UpdateCategoryInput, ApiResponse } from "../types/menuManagement.types";

export const categoriesApi = {
  getCategories: async (menuId: string): Promise<MenuCategory[]> => {
    const response = await api.get<ApiResponse<MenuCategory[]>>(`/api/v1/menus/${menuId}/categories`);
    return response.data;
  },
  
  createCategory: async (input: CreateCategoryInput): Promise<MenuCategory> => {
    const response = await api.post<ApiResponse<MenuCategory>>("/api/v1/categories", input);
    return response.data;
  },
  
  updateCategory: async (input: UpdateCategoryInput): Promise<MenuCategory> => {
    const response = await api.patch<ApiResponse<MenuCategory>>(`/api/v1/categories/${input.id}`, input);
    return response.data;
  },
  
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/v1/categories/${id}`);
  },
};
