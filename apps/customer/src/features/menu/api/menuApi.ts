import { api } from "../../../lib/api";
import type { MenuResponse, MenuQueryParams } from "../types/menu.types";

export const menuApi = {
  getMenu: async (params: MenuQueryParams): Promise<MenuResponse> => {
    const { venueId, availableOnly } = params;
    const queryParams = new URLSearchParams();
    if (availableOnly) {
      queryParams.append("availableOnly", "true");
    }
    
    const url = `/api/v1/menu/${venueId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return api.get(url);
  },
};
