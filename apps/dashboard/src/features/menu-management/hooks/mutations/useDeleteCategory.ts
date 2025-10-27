import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";

export const useDeleteCategory = (venueId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", venueId] });
    },
  });
};
