import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";
import type { CreateCategoryInput } from "../../types/menuManagement.types";

export const useCreateCategory = (venueId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.createCategory(venueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", venueId] });
    },
  });
};
