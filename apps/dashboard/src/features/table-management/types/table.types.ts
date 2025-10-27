export interface Table {
  id: string;
  venueId: string;
  label: string;
  isActive: boolean;
  capacity?: number; // Number of people the table can accommodate
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
  data: Table[];
}
