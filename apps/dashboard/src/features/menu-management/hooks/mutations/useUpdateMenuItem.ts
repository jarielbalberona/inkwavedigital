import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuItemsApi } from "../../api/menuItemsApi";
import type { UpdateMenuItemInput } from "../../types/menuManagement.types";

export const useUpdateMenuItem = (categoryId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateMenuItemInput) => menuItemsApi.updateMenuItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", categoryId] });
    },
  });
};
