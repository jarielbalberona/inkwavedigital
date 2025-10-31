import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "../types/kds.types";

interface KDSStatsProps {
  orders: Order[];
}

export const KDSStats: React.FC<KDSStatsProps> = ({ orders }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    // Filter out cancelled orders for all calculations
    const nonCancelledOrders = orders.filter(order => order.status !== 'CANCELLED');
    
    // Total orders (all non-cancelled)
    const totalOrders = nonCancelledOrders.length;
    
    // Running earnings (all non-cancelled)
    const runningEarnings = nonCancelledOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Served orders only
    const servedOrders = nonCancelledOrders.filter(order => order.status === 'SERVED');
    const servedCount = servedOrders.length;
    const servedEarnings = servedOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Active orders (NEW, PREPARING, READY)
    const activeOrders = nonCancelledOrders.filter(order => 
      order.status === 'NEW' || order.status === 'PREPARING' || order.status === 'READY'
    );
    const activeCount = activeOrders.length;
    
    return {
      totalOrders,
      runningEarnings,
      servedCount,
      servedEarnings,
      activeCount,
    };
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Running Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.runningEarnings)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Served Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.servedCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Served Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.servedEarnings)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.activeCount}</div>
        </CardContent>
      </Card>
    </div>
  );
};

