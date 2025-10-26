import { api } from "../../../lib/api";
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput, ApiResponse } from "../types/menuManagement.types";

export const menuItemsApi = {
  getMenuItems: async (categoryId: string): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<MenuItem[]>>(`/api/v1/categories/${categoryId}/items`);
    return response.data;
  },
  
  createMenuItem: async (input: CreateMenuItemInput): Promise<MenuItem> => {
    const response = await api.post<ApiResponse<MenuItem>>("/api/v1/menu-items", input);
    return response.data;
  },
  
  updateMenuItem: async (input: UpdateMenuItemInput): Promise<MenuItem> => {
    const response = await api.patch<ApiResponse<MenuItem>>(`/api/v1/menu-items/${input.id}`, input);
    return response.data;
  },
  
  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/v1/menu-items/${id}`);
  },
  
  updateAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const response = await api.patch<ApiResponse<MenuItem>>(`/api/v1/menu-items/${id}/availability`, { isAvailable });
    return response.data;
  },
};
