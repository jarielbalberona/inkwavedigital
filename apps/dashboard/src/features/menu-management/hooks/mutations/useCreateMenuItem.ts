import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuItemsApi } from "../../api/menuItemsApi";
import type { CreateMenuItemInput } from "../../types/menuManagement.types";

export const useCreateMenuItem = (categoryId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => menuItemsApi.createMenuItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", categoryId] });
    },
  });
};
