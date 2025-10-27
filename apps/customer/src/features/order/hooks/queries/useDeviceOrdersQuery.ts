import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/orderApi";

export function useDeviceOrdersQuery(deviceId: string, venueId?: string) {
  return useQuery({
    queryKey: ["device-orders", deviceId, venueId],
    queryFn: () => orderApi.getDeviceOrders(deviceId, venueId),
    enabled: !!deviceId,
    refetchInterval: 5000, // Poll every 5 seconds for order status updates
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
}

