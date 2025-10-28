import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";
import type { UpdateItemOptionInput } from "../types/menuManagement.types";

export const useUpdateItemOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateItemOptionInput) => itemOptionsApi.updateItemOption(input),
    onSuccess: () => {
      // Invalidate all item options queries
      queryClient.invalidateQueries({ queryKey: ["itemOptions"] });
    },
  });
};

