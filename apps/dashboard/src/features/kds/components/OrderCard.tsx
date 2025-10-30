import React, { useState, useEffect } from "react";
import { ClockIcon, UserIcon, UserGroupIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useUpdateOrderStatus } from "../hooks/mutations/useUpdateOrderStatus";
import { getStatusColor, getNextStatus, formatOrderTime, formatOrderTotal, getTimeElapsed } from "../hooks/helpers/orderHelpers";
import type { Order } from "../types/kds.types";

interface OrderCardProps {
  order: Order;
  venueId: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, venueId }) => {
  const updateOrderStatusMutation = useUpdateOrderStatus(venueId);
  const nextStatus = getNextStatus(order.status);
  const [timeElapsed, setTimeElapsed] = useState(getTimeElapsed(order.createdAt));

  // Update elapsed time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(getTimeElapsed(order.createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order.createdAt]);

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
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {formatOrderTime(order.createdAt)}
            </div>
            <div className="text-xs font-medium text-orange-600">
              {timeElapsed}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Table/Device Info and Pax */}
      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 mr-1" />
          {order.tableLabel || (order.tableId ? `Table ${order.tableId}` : `Device ${order.deviceId.slice(0, 8)}`)}
        </div>
        {order.pax && (
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            {order.pax} {order.pax === 1 ? 'guest' : 'guests'}
          </div>
        )}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-start text-sm">
            <DocumentTextIcon className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-900 font-medium">Order Note: </span>
            <span className="text-blue-800 ml-1">{order.notes}</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.items.map((item) => {
          let parsedOptions: any[] = [];
          try {
            if (item.optionsJson) {
              parsedOptions = JSON.parse(item.optionsJson);
            }
          } catch (e) {
            console.error("Failed to parse options JSON", e);
          }

          return (
            <div key={item.id} className="border-b border-gray-100 pb-2 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-gray-900 font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  
                  {/* Display selected options */}
                  {parsedOptions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {parsedOptions.map((option: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600">
                          <span className="font-medium">{option.optionName}:</span>{" "}
                          {option.values?.map((value: any, vIdx: number) => (
                            <span key={vIdx}>
                              {value.valueLabel}
                              {value.priceDelta !== 0 && (
                                <span className="text-green-600">
                                  {" "}(+₱{value.priceDelta.toFixed(2)})
                                </span>
                              )}
                              {vIdx < option.values.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Display item notes */}
                  {item.notes && (
                    <div className="mt-1 text-xs text-gray-500 italic">
                      Note: {item.notes}
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-900 ml-2">
                  {formatOrderTotal(item.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
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
