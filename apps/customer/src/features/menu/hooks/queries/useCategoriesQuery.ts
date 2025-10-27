import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";

export const useCategoriesQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["categories", venueId],
    queryFn: () => categoriesApi.getCategories(venueId),
    enabled: !!venueId,
  });
};
