import { api } from "../../../lib/api";
import type { OrdersResponse, UpdateOrderStatusInput, UpdateOrderStatusResponse } from "../types/kds.types";

export const ordersApi = {
  getOrders: async (venueId: string): Promise<OrdersResponse> => {
    return api.get(`/api/v1/venues/${venueId}/orders`);
  },
  
  updateOrderStatus: async (input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResponse> => {
    return api.patch(`/api/v1/orders/${input.orderId}/status`, {
      newStatus: input.newStatus,
    });
  },
};
