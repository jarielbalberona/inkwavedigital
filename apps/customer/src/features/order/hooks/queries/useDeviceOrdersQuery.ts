import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/orderApi";

export function useDeviceOrdersQuery(deviceId: string, venueId?: string) {
  return useQuery({
    queryKey: ["device-orders", deviceId, venueId],
    queryFn: () => orderApi.getDeviceOrders(deviceId, venueId),
    enabled: !!deviceId,
    // Removed polling - WebSocket will invalidate this query on updates
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
}

