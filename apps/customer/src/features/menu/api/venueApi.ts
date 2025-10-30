import { api } from "../../../lib/api";
import type { TenantSettings } from "@inkwave/types";

export interface VenueInfo {
  id: string;
  name: string;
  slug: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings?: TenantSettings | null;
  };
}

export const venueApi = {
  getVenueInfo: async (venueId: string): Promise<VenueInfo> => {
    // API returns: { success: true, data: { venue: VenueInfo } }
    const response = await api.get<{ success: boolean; data: { venue: VenueInfo } }>(`/api/v1/venues/${venueId}/info`);
    return response.data.venue;
  },

  getVenueBySlug: async (tenantSlug: string, venueSlug: string): Promise<{ venue: VenueInfo; tenant: { id: string; name: string; slug: string; settings?: TenantSettings | null } }> => {
    // API returns: { success: true, data: { venue: {...}, tenant: {...} } }
    const response = await api.get<{ success: boolean; data: { venue: VenueInfo; tenant: { id: string; name: string; slug: string; settings?: TenantSettings | null } } }>(
      `/api/v1/venues/by-slug/${tenantSlug}/${venueSlug}`
    );
    return response.data;
  },
};
