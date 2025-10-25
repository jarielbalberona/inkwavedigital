import { api } from "../../../lib/api";
import type { CreateCategoryInput, UpdateCategoryInput, MenuManagementResponse } from "../types/menuManagement.types";

export const categoriesApi = {
  getCategories: async (menuId: string): Promise<MenuManagementResponse> => {
    return api.get(`/api/v1/menus/${menuId}/categories`);
  },
  
  createCategory: async (input: CreateCategoryInput): Promise<MenuManagementResponse> => {
    return api.post("/api/v1/categories", input);
  },
  
  updateCategory: async (input: UpdateCategoryInput): Promise<MenuManagementResponse> => {
    return api.patch(`/api/v1/categories/${input.id}`, input);
  },
  
  deleteCategory: async (id: string): Promise<MenuManagementResponse> => {
    return api.delete(`/api/v1/categories/${id}`);
  },
};
