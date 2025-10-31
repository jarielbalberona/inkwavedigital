export interface Order {
  id: string;
  venueId: string;
  tableId?: string;
  tableLabel?: string;
  deviceId: string;
  status: "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  total: number;
  items: OrderItem[];
  pax?: number;
  isToGo?: boolean;
  notes?: string;
  staffNotes?: string;
  cancellationReason?: string;
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
  options?: SelectedOption[]; // Parsed array of selected options
  optionsJson?: any; // Raw data from API (can be various formats)
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  valueIds: string[];
  values: Array<{
    valueId: string;
    valueLabel: string;
    priceDelta: number;
  }>;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: string;
  cancellationReason?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data: {
    orderId: string;
    status: string;
    updatedAt: string;
  };
}

export interface UpdateStaffNotesInput {
  orderId: string;
  staffNotes: string;
}

export interface UpdateStaffNotesResponse {
  success: boolean;
  data: {
    orderId: string;
    staffNotes: string;
    updatedAt: string;
  };
}

export type DateRangeType = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  type: DateRangeType;
}
