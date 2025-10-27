import { api } from "../../../lib/api";
import type { CreateOrderInput, CreateOrderData, CreateOrderResponse, ActiveOrder } from "../types/order.types";
import type { ApiResponse } from "../../menu/types/menu.types";

export const orderApi = {
  createOrder: async (orderData: CreateOrderInput): Promise<CreateOrderData> => {
    const response = await api.post<ApiResponse<CreateOrderData>>("/api/v1/orders", orderData);
    return response.data;
  },

  getDeviceOrders: async (deviceId: string, venueId?: string): Promise<ActiveOrder[]> => {
    const params = venueId ? `?venueId=${venueId}` : "";
    const response = await api.get<ApiResponse<ActiveOrder[]>>(`/api/v1/orders/device/${deviceId}${params}`);
    return response.data;
  },
};
