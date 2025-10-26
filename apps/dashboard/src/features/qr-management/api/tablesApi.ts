import { api } from "../../../lib/api";
import type { Table } from "../types/qr.types";
import type { ApiResponse } from "../../menu-management/types/menuManagement.types";

export const tablesApi = {
  getTables: async (venueId: string): Promise<Table[]> => {
    const response = await api.get<ApiResponse<Table[]>>(`/api/v1/venues/${venueId}/tables`);
    return response.data;
  },
};
