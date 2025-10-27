import { useQuery } from "@tanstack/react-query";
import { venueApi } from "../../api/venueApi";

export const useVenueInfoQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["venueInfo", venueId],
    queryFn: () => venueApi.getVenueInfo(venueId),
    enabled: !!venueId,
  });
};
