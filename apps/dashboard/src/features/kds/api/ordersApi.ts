import { api } from "../../../lib/api";
import type { Order, UpdateOrderStatusInput, UpdateOrderStatusResponse } from "../types/kds.types";
import type { ApiResponse } from "../../menu-management/types/menuManagement.types";

export const ordersApi = {
  getOrders: async (venueId: string): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>(`/api/v1/venues/${venueId}/orders`);
    return response.data;
  },
  
  updateOrderStatus: async (input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResponse['data']> => {
    const response = await api.patch<ApiResponse<UpdateOrderStatusResponse['data']>>(`/api/v1/orders/${input.orderId}/status`, {
      newStatus: input.newStatus,
    });
    return response.data;
  },
};
