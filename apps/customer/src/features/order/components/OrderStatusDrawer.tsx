import React from "react";
import { XMarkIcon, ClockIcon, CheckCircleIcon, FireIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: ClockIcon,
  },
  PREPARING: {
    label: "Preparing",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    icon: FireIcon,
  },
  READY: {
    label: "Ready",
    color: "text-success",
    bgColor: "bg-success/10",
    icon: CheckCircleIcon,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
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
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">My Orders</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/90"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active orders</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your orders will appear here once you place them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={order.id} className="overflow-hidden gap-0 py-0">
                    {/* Order Header */}
                    <div className={`${statusConfig.bgColor} p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                        <span className={`font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
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
                                <span className="font-medium text-foreground">
                                  {item.quantity}x
                                </span>
                                <span className="text-foreground">{item.itemName}</span>
                              </div>
                              {options && Object.keys(options).length > 0 && (
                                <div className="ml-8 text-xs text-muted-foreground mt-1">
                                  {Object.entries(options).map(([key, values]) => (
                                    <div key={key}>
                                      {Array.isArray(values) ? values.join(", ") : values}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <div className="ml-8 text-xs text-muted-foreground italic mt-1">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                            <span className="text-foreground font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        );
                      })}

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground italic">
                            Order Note: {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-bold text-lg text-foreground">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="border-t border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground text-center">
              Order status updates automatically
            </p>
          </div>
        )}
      </div>
    </>
  );
};

