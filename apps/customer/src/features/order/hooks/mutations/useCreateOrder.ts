import { useMutation } from "@tanstack/react-query";
import { orderApi } from "../../api/orderApi";
import type { CreateOrderInput } from "../../types/order.types";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (orderData: CreateOrderInput) => orderApi.createOrder(orderData),
    onSuccess: (data) => {
      console.log("Order created successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
    },
  });
};
