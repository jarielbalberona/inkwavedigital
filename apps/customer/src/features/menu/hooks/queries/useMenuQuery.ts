import { useQuery } from "@tanstack/react-query";
import { menuApi } from "../../api/menuApi";
import type { MenuQueryParams } from "../../types/menu.types";

export const useMenuQuery = (params: MenuQueryParams) => {
  return useQuery({
    queryKey: ["menu", params.venueId, params.availableOnly],
    queryFn: () => menuApi.getMenu(params),
    staleTime: 0, // Always fetch fresh - critical for availability and price changes
    gcTime: 0, // Don't cache - always get latest menu data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};
