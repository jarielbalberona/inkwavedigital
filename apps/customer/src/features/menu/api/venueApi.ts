import { api } from "../../../lib/api";

export interface VenueInfo {
  id: string;
  name: string;
  slug: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export const venueApi = {
  getVenueInfo: async (venueId: string): Promise<VenueInfo> => {
    // API returns: { success: true, data: { venue: VenueInfo } }
    const response = await api.get<{ success: boolean; data: { venue: VenueInfo } }>(`/api/v1/venues/${venueId}/info`);
    return response.data.venue;
  },
};
