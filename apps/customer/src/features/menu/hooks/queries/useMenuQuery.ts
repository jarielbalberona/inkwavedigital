import { useQuery } from "@tanstack/react-query";
import { menuApi } from "../../api/menuApi";
import type { MenuQueryParams } from "../../types/menu.types";

export const useMenuQuery = (params: MenuQueryParams) => {
  return useQuery({
    queryKey: ["menu", params.venueId, params.availableOnly],
    queryFn: () => menuApi.getMenu(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
