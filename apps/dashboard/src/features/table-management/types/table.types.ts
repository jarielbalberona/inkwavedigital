export interface Table {
  id: string;
  venueId: string;
  tableNumber: number;
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QRCode {
  tableId: string;
  tableLabel: string;
  qrUrl: string;
  qrData: string;
}

export interface TablesResponse {
  success: boolean;
  data: {
    tables: Table[];
    total: number;
  };
}

export interface CreateTableInput {
  venueId: string;
  tableNumber?: number; // Auto-generated if not provided
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
}

export interface UpdateTableInput {
  id: string;
  tableNumber?: number;
  name?: string;
  label?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface CreateTableResponse {
  success: boolean;
  data: Table;
}

export interface UpdateTableResponse {
  success: boolean;
  data: Table;
}

export interface DeleteTableResponse {
  success: boolean;
  message: string;
}
