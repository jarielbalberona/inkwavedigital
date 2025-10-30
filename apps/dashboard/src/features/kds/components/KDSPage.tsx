import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wsClient } from "../../../lib/websocket";
import { useOrdersQuery } from "../hooks/queries/useOrdersQuery";
import { OrderStatusColumn } from "./OrderStatusColumn";
import { groupOrdersByStatus } from "../hooks/helpers/orderHelpers";
import type { Order } from "../types/kds.types";

interface KDSPageProps {
  venueId: string;
}

export const KDSPage: React.FC<KDSPageProps> = ({ venueId }) => {
  const queryClient = useQueryClient();
  const { data: ordersData, isLoading, error } = useOrdersQuery(venueId);
  
  const orders = ordersData || [];
  const ordersByStatus = groupOrdersByStatus(orders);

  // Track previous order IDs to detect new orders
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    wsClient.connect(venueId);

    // Subscribe to messages
    const unsubscribe = wsClient.subscribe((message) => {
      if (message.type === "order_created" || message.type === "order_status_changed") {
        // Invalidate queries to refetch orders
        queryClient.invalidateQueries({ queryKey: ["orders", venueId] });
      }
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, [venueId, queryClient]);

  // Detect new orders and show notifications
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const currentOrderIds = new Set(orders.map((o: Order) => o.id));

    // Find new orders (orders that weren't in the previous set)
    const newOrders = orders.filter((order: Order) => 
      !previousOrderIdsRef.current.has(order.id) && order.status === 'NEW'
    );

    // Show notification for each new order
    newOrders.forEach((order: Order) => {
      const orderNumber = order.id.slice(0, 8);
      const tableInfo = order.tableLabel || (order.tableId ? `Table ${order.tableId}` : `Device ${order.deviceId.slice(0, 8)}`);
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

      // Show toast notification
      toast.info('New Order Received!', {
        description: `Order #${orderNumber} from ${tableInfo} - ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
        duration: 10000,
      });

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 New Order!', {
          body: `Order #${orderNumber} from ${tableInfo}\n${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
          icon: '/icon.png',
          tag: `order-${order.id}`,
          requireInteraction: true,
        });
      }
    });

    // Update the previous order IDs set
    previousOrderIdsRef.current = currentOrderIds;
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load orders</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
        <p className="text-gray-600">Manage orders in real-time</p>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OrderStatusColumn
            title="New Orders"
            orders={ordersByStatus.NEW || []}
            venueId={venueId}
            status="NEW"
          />
          
          <OrderStatusColumn
            title="Preparing"
            orders={ordersByStatus.PREPARING || []}
            venueId={venueId}
            status="PREPARING"
          />
          
          <OrderStatusColumn
            title="Ready"
            orders={ordersByStatus.READY || []}
            venueId={venueId}
            status="READY"
          />
          
          <OrderStatusColumn
            title="Served"
            orders={ordersByStatus.SERVED || []}
            venueId={venueId}
            status="SERVED"
          />
        </div>
      </div>
    </div>
  );
};
