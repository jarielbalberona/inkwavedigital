import { api } from "../../../lib/api";
import type { CreateOrderInput, CreateOrderData, CreateOrderResponse } from "../types/order.types";
import type { ApiResponse } from "../../menu/types/menu.types";

export const orderApi = {
  createOrder: async (orderData: CreateOrderInput): Promise<CreateOrderData> => {
    const response = await api.post<ApiResponse<CreateOrderData>>("/api/v1/orders", orderData);
    return response.data;
  },
};
