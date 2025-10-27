export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  ownerEmail?: string;
  settings?: Record<string, any>;
  initialVenue?: {
    name: string;
    slug: string;
    address?: string;
    timezone?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

