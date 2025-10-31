import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../api/ordersApi";

export const useOrdersQuery = (venueId: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ["orders", venueId, dateFrom, dateTo],
    queryFn: () => ordersApi.getOrders(venueId, dateFrom, dateTo),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider data stale
  });
};
