import React from "react";
import { XMarkIcon, ClockIcon, CheckCircleIcon, FireIcon } from "@heroicons/react/24/outline";
import type { ActiveOrder } from "../types/order.types";
import { formatPrice } from "../../menu/hooks/helpers/menuHelpers";

interface OrderStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ActiveOrder[];
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  NEW: {
    label: "Order Received",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: ClockIcon,
  },
  PREPARING: {
    label: "Preparing",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: FireIcon,
  },
  READY: {
    label: "Ready",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircleIcon,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: CheckCircleIcon,
  },
};

export const OrderStatusDrawer: React.FC<OrderStatusDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  isLoading,
}) => {
  if (!isOpen) return null;

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NEW;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const parseOptions = (optionsJson?: string) => {
    if (!optionsJson) return null;
    try {
      return JSON.parse(optionsJson);
    } catch {
      return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">My Orders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No active orders</p>
              <p className="text-sm text-gray-400 mt-2">
                Your orders will appear here once you place them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className={`${statusConfig.bgColor} p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                        <span className={`font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatTime(order.createdAt)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-3 space-y-2">
                      {order.items.map((item) => {
                        const options = parseOptions(item.optionsJson);
                        return (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {item.quantity}x
                                </span>
                                <span className="text-gray-900">{item.itemName}</span>
                              </div>
                              {options && Object.keys(options).length > 0 && (
                                <div className="ml-8 text-xs text-gray-500 mt-1">
                                  {Object.entries(options).map(([key, values]) => (
                                    <div key={key}>
                                      {Array.isArray(values) ? values.join(", ") : values}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <div className="ml-8 text-xs text-gray-500 italic mt-1">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-700 font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        );
                      })}

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">
                            Order Note: {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Order status updates automatically
            </p>
          </div>
        )}
      </div>
    </>
  );
};

