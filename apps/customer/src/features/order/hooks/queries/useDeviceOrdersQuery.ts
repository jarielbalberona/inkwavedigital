import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/orderApi";

export function useDeviceOrdersQuery(deviceId: string, venueId?: string) {
  return useQuery({
    queryKey: ["device-orders", deviceId, venueId],
    queryFn: () => orderApi.getDeviceOrders(deviceId, venueId),
    enabled: !!deviceId,
    refetchInterval: 10000, // Fallback polling every 10 seconds (WebSocket is primary)
    staleTime: 0, // Always consider data stale to ensure fresh updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

