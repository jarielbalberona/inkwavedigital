import { api } from "../../../lib/api";
import type { TablesResponse } from "../types/qr.types";

export const tablesApi = {
  getTables: async (venueId: string): Promise<TablesResponse> => {
    return api.get(`/api/v1/venues/${venueId}/tables`);
  },
};
