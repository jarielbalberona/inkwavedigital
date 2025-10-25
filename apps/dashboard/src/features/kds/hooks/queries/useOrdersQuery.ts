import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../api/ordersApi";

export const useOrdersQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["orders", venueId],
    queryFn: () => ordersApi.getOrders(venueId),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider data stale
  });
};
