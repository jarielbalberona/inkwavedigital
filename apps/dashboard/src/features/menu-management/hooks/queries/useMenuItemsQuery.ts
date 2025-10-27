import { useQuery } from "@tanstack/react-query";
import { menuItemsApi } from "../../api/menuItemsApi";

export const useMenuItemsQuery = (categoryId: string) => {
  return useQuery({
    queryKey: ["menuItems", categoryId],
    queryFn: () => menuItemsApi.getMenuItems(categoryId),
    enabled: !!categoryId,
  });
};
