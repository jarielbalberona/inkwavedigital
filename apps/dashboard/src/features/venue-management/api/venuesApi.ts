import { api } from "../../../lib/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetVenuesResponse {
  venues: Venue[];
}

export interface CreateVenueInput {
  name: string;
  slug: string;
  address?: string;
  timezone?: string;
}

export interface CreateVenueResponse {
  venue: Venue;
}

export interface UpdateVenueInput {
  name?: string;
  address?: string;
  timezone?: string;
}

export interface VenueInfo {
  venue: {
    id: string;
    name: string;
    slug: string;
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export const venuesApi = {
  getVenues: async (tenantId: string): Promise<GetVenuesResponse> => {
    const response = await api.get<ApiResponse<GetVenuesResponse>>("/api/v1/venues", {
      headers: {
        "x-tenant-id": tenantId,
      },
    });
    // response = { success: true, data: { venues: [...] } }
    // so response.data = { venues: [...] }
    return response.data;
  },

  getVenueInfo: async (venueId: string): Promise<VenueInfo> => {
    const response = await api.get<ApiResponse<VenueInfo>>(`/api/v1/venues/${venueId}/info`);
    return response.data;
  },

  createVenue: async (tenantId: string, input: CreateVenueInput): Promise<CreateVenueResponse> => {
    const response = await api.post<ApiResponse<CreateVenueResponse>>(
      "/api/v1/venues",
      input,
      {
        headers: {
          "x-tenant-id": tenantId,
        },
      }
    );
    // response = { success: true, data: { venue: {...} } }
    // so response.data = { venue: {...} }
    return response.data;
  },

  updateVenue: async (venueId: string, input: UpdateVenueInput): Promise<CreateVenueResponse> => {
    const response = await api.put<ApiResponse<CreateVenueResponse>>(
      `/api/v1/venues/${venueId}`,
      input
    );
    // response = { success: true, data: { venue: {...} } }
    // so response.data = { venue: {...} }
    return response.data;
  },

  deleteVenue: async (venueId: string): Promise<void> => {
    await api.delete(`/api/v1/venues/${venueId}`);
  },
};

