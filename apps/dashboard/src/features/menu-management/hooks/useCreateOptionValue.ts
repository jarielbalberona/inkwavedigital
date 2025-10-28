import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";
import type { CreateOptionValueInput } from "../types/menuManagement.types";

export const useCreateOptionValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOptionValueInput) => itemOptionsApi.createOptionValue(input),
    onSuccess: () => {
      // Invalidate all item options queries to refresh values
      queryClient.invalidateQueries({ queryKey: ["itemOptions"] });
    },
  });
};

