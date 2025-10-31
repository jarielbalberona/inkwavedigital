export interface CreateOrderInput {
  venueId: string;
  tableId?: string;
  deviceId: string;
  pax?: number;
  isToGo?: boolean;
  items: OrderItemInput[];
}

export interface OrderItemInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  options?: Record<string, string[]>;
}

export interface CreateOrderData {
  orderId: string;
  status?: string;
  total: number;
  createdAt?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: CreateOrderData;
}

export interface OrderConfirmation {
  orderId: string;
  status: string;
  total: number;
  estimatedWaitTime?: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  optionsJson?: string;
}

export interface ActiveOrder {
  id: string;
  venueId: string;
  tableId?: string;
  status: string;
  total: number;
  deviceId: string;
  pax?: number;
  isToGo?: boolean;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
