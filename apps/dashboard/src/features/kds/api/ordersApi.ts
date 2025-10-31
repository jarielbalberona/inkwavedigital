import { api } from "../../../lib/api";
import type { Order, UpdateOrderStatusInput, UpdateOrderStatusResponse, UpdateStaffNotesInput, UpdateStaffNotesResponse } from "../types/kds.types";
import type { ApiResponse } from "../../menu-management/types/menuManagement.types";

// API response types
interface ApiOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  optionsJson?: Record<string, unknown>;
}

interface ApiOrder {
  id: string;
  venueId: string;
  tableId?: string;
  tableLabel?: string;
  status: string;
  items: ApiOrderItem[];
  deviceId?: string;
  pax?: number;
  notes?: string;
  staffNotes?: string;
  cancellationReason?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiOrdersResponse {
  orders: ApiOrder[];
  total: number;
}

export const ordersApi = {
  getOrders: async (venueId: string, dateFrom?: string, dateTo?: string): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    const url = `/api/v1/venues/${venueId}/orders${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<ApiResponse<ApiOrdersResponse>>(url);
    
    // Transform API response to match KDS types
    const orders: Order[] = response.data.orders.map(order => ({
      id: order.id,
      venueId: order.venueId,
      tableId: order.tableId,
      tableLabel: order.tableLabel,
      deviceId: order.deviceId || "",
      status: order.status as Order["status"],
      total: order.total,
      pax: order.pax,
      notes: order.notes,
      staffNotes: order.staffNotes,
      cancellationReason: order.cancellationReason,
      items: order.items.map(item => ({
        id: item.id,
        itemId: item.itemId,
        name: item.itemName, // Transform itemName to name
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity, // Calculate totalPrice
        notes: item.notes,
        optionsJson: item.optionsJson as any, // JSONB from DB is already parsed
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
    
    return orders;
  },
  
  updateOrderStatus: async (input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResponse['data']> => {
    const response = await api.patch<ApiResponse<UpdateOrderStatusResponse['data']>>(`/api/v1/orders/${input.orderId}/status`, {
      status: input.newStatus,
      cancellationReason: input.cancellationReason,
    });
    return response.data;
  },

  updateStaffNotes: async (input: UpdateStaffNotesInput): Promise<UpdateStaffNotesResponse['data']> => {
    const response = await api.patch<ApiResponse<UpdateStaffNotesResponse['data']>>(`/api/v1/orders/${input.orderId}/staff-notes`, {
      staffNotes: input.staffNotes,
    });
    return response.data;
  },
};
