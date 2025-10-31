import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categoriesApi";

export const useCategoriesQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["categories", venueId],
    queryFn: () => categoriesApi.getCategories(venueId),
    enabled: !!venueId,
    staleTime: 0, // Always fetch fresh - reflect category changes immediately
    gcTime: 0, // Don't cache - always get latest categories
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
