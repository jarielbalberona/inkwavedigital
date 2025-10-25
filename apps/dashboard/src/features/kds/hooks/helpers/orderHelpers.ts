import type { Order } from "../types/kds.types";

export const groupOrdersByStatus = (orders: Order[]) => {
  return orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "bg-red-100 text-red-800 border-red-200";
    case "PREPARING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "READY":
      return "bg-green-100 text-green-800 border-green-200";
    case "SERVED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getNextStatus = (currentStatus: string): string | null => {
  switch (currentStatus) {
    case "NEW":
      return "PREPARING";
    case "PREPARING":
      return "READY";
    case "READY":
      return "SERVED";
    default:
      return null;
  }
};

export const formatOrderTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatOrderTotal = (total: number): string => {
  return `₱${total.toFixed(2)}`;
};
