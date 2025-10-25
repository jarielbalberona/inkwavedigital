import React from "react";
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { useUpdateOrderStatus } from "../hooks/mutations/useUpdateOrderStatus";
import { getStatusColor, getNextStatus, formatOrderTime, formatOrderTotal } from "../hooks/helpers/orderHelpers";
import type { Order } from "../types/kds.types";

interface OrderCardProps {
  order: Order;
  venueId: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, venueId }) => {
  const updateOrderStatusMutation = useUpdateOrderStatus(venueId);
  const nextStatus = getNextStatus(order.status);

  const handleStatusUpdate = (newStatus: string) => {
    updateOrderStatusMutation.mutate({
      orderId: order.id,
      newStatus,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <ClockIcon className="w-4 h-4 mr-1" />
            {formatOrderTime(order.createdAt)}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Table/Device Info */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <UserIcon className="w-4 h-4 mr-1" />
        {order.tableId ? `Table ${order.tableId}` : `Device ${order.deviceId.slice(0, 8)}`}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">
              {item.quantity}x {item.name}
            </span>
            <span className="font-medium">{formatOrderTotal(item.totalPrice)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total:</span>
          <span className="font-bold text-lg text-green-600">
            {formatOrderTotal(order.total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={updateOrderStatusMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateOrderStatusMutation.isPending ? "Updating..." : `Mark as ${nextStatus}`}
          </button>
        )}
        
        {order.status !== "CANCELLED" && (
          <button
            onClick={() => handleStatusUpdate("CANCELLED")}
            disabled={updateOrderStatusMutation.isPending}
            className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
