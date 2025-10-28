import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";
import type { CreateItemOptionInput } from "../types/menuManagement.types";

export const useCreateItemOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItemOptionInput) => itemOptionsApi.createItemOption(input),
    onSuccess: (_, variables) => {
      // Invalidate the options query for this item
      queryClient.invalidateQueries({ queryKey: ["itemOptions", variables.itemId] });
    },
  });
};

