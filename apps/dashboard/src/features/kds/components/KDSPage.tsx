import React from "react";
import { useOrdersQuery } from "../hooks/queries/useOrdersQuery";
import { OrderStatusColumn } from "./OrderStatusColumn";
import { groupOrdersByStatus } from "../hooks/helpers/orderHelpers";

interface KDSPageProps {
  venueId: string;
}

export const KDSPage: React.FC<KDSPageProps> = ({ venueId }) => {
  const { data: ordersData, isLoading, error } = useOrdersQuery(venueId);
  
  const orders = ordersData || [];
  const ordersByStatus = groupOrdersByStatus(orders);

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
