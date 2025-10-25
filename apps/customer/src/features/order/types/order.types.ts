export interface CreateOrderInput {
  venueId: string;
  tableId?: string;
  deviceId: string;
  items: OrderItemInput[];
}

export interface OrderItemInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  options?: Record<string, any>;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    status: string;
    total: number;
    createdAt: string;
  };
}

export interface OrderConfirmation {
  orderId: string;
  status: string;
  total: number;
  estimatedWaitTime?: number;
  createdAt: string;
}
