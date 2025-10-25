import React from "react";
import { OrderCard } from "./OrderCard";
import type { Order } from "../types/kds.types";

interface OrderStatusColumnProps {
  title: string;
  orders: Order[];
  venueId: string;
  status: string;
}

export const OrderStatusColumn: React.FC<OrderStatusColumnProps> = ({
  title,
  orders,
  venueId,
  status,
}) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-600">{orders.length} orders</span>
      </div>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No {status.toLowerCase()} orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              venueId={venueId}
            />
          ))
        )}
      </div>
    </div>
  );
};
