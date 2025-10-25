import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../../api/ordersApi";
import type { UpdateOrderStatusInput } from "../types/kds.types";

export const useUpdateOrderStatus = (venueId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) => ordersApi.updateOrderStatus(input),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ["orders", venueId] });
    },
  });
};
