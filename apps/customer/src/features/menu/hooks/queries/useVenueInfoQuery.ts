import { useQuery } from "@tanstack/react-query";
import { venueApi } from "../../api/venueApi";

export const useVenueInfoQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["venueInfo", venueId],
    queryFn: () => venueApi.getVenueInfo(venueId),
    enabled: !!venueId,
    staleTime: 0, // Always fetch fresh to reflect tenant theme changes immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes for back navigation
  });
};
