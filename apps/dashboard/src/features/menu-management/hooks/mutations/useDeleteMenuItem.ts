import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuItemsApi } from "../../api/menuItemsApi";

export const useDeleteMenuItem = (categoryId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => menuItemsApi.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", categoryId] });
    },
  });
};

