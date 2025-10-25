import { api } from "../../../lib/api";
import type { CreateOrderInput, CreateOrderResponse } from "../types/order.types";

export const orderApi = {
  createOrder: async (orderData: CreateOrderInput): Promise<CreateOrderResponse> => {
    return api.post("/api/v1/orders", orderData);
  },
};
