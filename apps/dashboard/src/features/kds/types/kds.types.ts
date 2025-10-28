export interface Order {
  id: string;
  venueId: string;
  tableId?: string;
  deviceId: string;
  status: "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  optionsJson?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data: {
    orderId: string;
    status: string;
    updatedAt: string;
  };
}
