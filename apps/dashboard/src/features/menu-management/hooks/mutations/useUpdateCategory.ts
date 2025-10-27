import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";
import type { UpdateCategoryInput } from "../../types/menuManagement.types";

export const useUpdateCategory = (venueId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesApi.updateCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", venueId] });
    },
  });
};
