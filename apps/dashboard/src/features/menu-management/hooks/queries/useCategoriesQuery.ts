import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";

export const useCategoriesQuery = (menuId: string) => {
  return useQuery({
    queryKey: ["categories", menuId],
    queryFn: () => categoriesApi.getCategories(menuId),
    enabled: !!menuId,
  });
};
