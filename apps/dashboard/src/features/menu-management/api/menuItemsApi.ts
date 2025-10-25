import { api } from "../../../lib/api";
import type { CreateMenuItemInput, UpdateMenuItemInput, MenuManagementResponse } from "../types/menuManagement.types";

export const menuItemsApi = {
  getMenuItems: async (categoryId: string): Promise<MenuManagementResponse> => {
    return api.get(`/api/v1/categories/${categoryId}/items`);
  },
  
  createMenuItem: async (input: CreateMenuItemInput): Promise<MenuManagementResponse> => {
    return api.post("/api/v1/menu-items", input);
  },
  
  updateMenuItem: async (input: UpdateMenuItemInput): Promise<MenuManagementResponse> => {
    return api.patch(`/api/v1/menu-items/${input.id}`, input);
  },
  
  deleteMenuItem: async (id: string): Promise<MenuManagementResponse> => {
    return api.delete(`/api/v1/menu-items/${id}`);
  },
  
  updateAvailability: async (id: string, isAvailable: boolean): Promise<MenuManagementResponse> => {
    return api.patch(`/api/v1/menu-items/${id}/availability`, { isAvailable });
  },
};
