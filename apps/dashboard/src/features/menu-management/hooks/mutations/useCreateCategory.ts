import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";
import type { CreateCategoryInput } from "../../types/menuManagement.types";

export const useCreateCategory = (menuId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", menuId] });
    },
  });
};
