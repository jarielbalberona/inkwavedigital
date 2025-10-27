import { api } from "../../../lib/api";
import type { 
  Table, 
  TablesResponse, 
  CreateTableInput, 
  UpdateTableInput,
  CreateTableResponse,
  UpdateTableResponse,
  DeleteTableResponse
} from "../types/table.types";

export const tablesApi = {
  getTables: async (venueId: string): Promise<{ tables: Table[]; total: number }> => {
    const response = await api.get<TablesResponse>(`/api/v1/venues/${venueId}/tables`);
    return response.data;
  },

  createTable: async (data: CreateTableInput): Promise<Table> => {
    const response = await api.post<CreateTableResponse>(
      `/api/v1/venues/${data.venueId}/tables`,
      data
    );
    return response.data;
  },

  updateTable: async (data: UpdateTableInput): Promise<Table> => {
    const { id, ...updateData } = data;
    const response = await api.put<UpdateTableResponse>(
      `/api/v1/venues/tables/${id}`,
      updateData
    );
    return response.data;
  },

  deleteTable: async (tableId: string): Promise<void> => {
    await api.delete<DeleteTableResponse>(`/api/v1/venues/tables/${tableId}`);
  },
};
