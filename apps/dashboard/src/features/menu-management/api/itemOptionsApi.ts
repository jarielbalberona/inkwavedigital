import { api } from "../../../lib/api";
import type {
  MenuItemOption,
  CreateItemOptionInput,
  UpdateItemOptionInput,
  CreateOptionValueInput,
  UpdateOptionValueInput,
  MenuItemOptionValue,
  ApiResponse,
} from "../types/menuManagement.types";

export const itemOptionsApi = {
  // Get all options for an item
  getItemOptions: async (itemId: string): Promise<{ options: MenuItemOption[] }> => {
    const response = await api.get<ApiResponse<{ options: MenuItemOption[] }>>(
      `/api/v1/menu/items/${itemId}/options`
    );
    return response.data;
  },

  // Create a new option
  createItemOption: async (input: CreateItemOptionInput): Promise<MenuItemOption> => {
    const response = await api.post<ApiResponse<MenuItemOption>>(
      `/api/v1/menu/items/${input.itemId}/options`,
      {
        name: input.name,
        type: input.type,
        required: input.required,
      }
    );
    return response.data;
  },

  // Update an option
  updateItemOption: async (input: UpdateItemOptionInput): Promise<MenuItemOption> => {
    const response = await api.patch<ApiResponse<MenuItemOption>>(
      `/api/v1/menu/options/${input.id}`,
      {
        name: input.name,
        type: input.type,
        required: input.required,
      }
    );
    return response.data;
  },

  // Delete an option
  deleteItemOption: async (optionId: string): Promise<void> => {
    await api.delete(`/api/v1/menu/options/${optionId}`);
  },

  // Create a new option value
  createOptionValue: async (input: CreateOptionValueInput): Promise<MenuItemOptionValue> => {
    const response = await api.post<ApiResponse<MenuItemOptionValue>>(
      `/api/v1/menu/options/${input.optionId}/values`,
      {
        label: input.label,
        priceDelta: input.priceDelta,
      }
    );
    return response.data;
  },

  // Update an option value
  updateOptionValue: async (input: UpdateOptionValueInput): Promise<MenuItemOptionValue> => {
    const response = await api.patch<ApiResponse<MenuItemOptionValue>>(
      `/api/v1/menu/option-values/${input.id}`,
      {
        label: input.label,
        priceDelta: input.priceDelta,
      }
    );
    return response.data;
  },

  // Delete an option value
  deleteOptionValue: async (valueId: string): Promise<void> => {
    await api.delete(`/api/v1/menu/option-values/${valueId}`);
  },
};

