import { api } from "../../../lib/api";
import type { Tenant, CreateTenantInput, ApiResponse } from "../types/admin.types";

export const tenantsApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<ApiResponse<Tenant[]>>("/api/v1/admin/tenants");
    return response.data;
  },
  
  getTenant: async (id: string): Promise<Tenant> => {
    const response = await api.get<ApiResponse<Tenant>>(`/api/v1/admin/tenants/${id}`);
    return response.data;
  },
  
  createTenant: async (input: CreateTenantInput): Promise<Tenant> => {
    const response = await api.post<ApiResponse<Tenant>>("/api/v1/admin/tenants", input);
    return response.data;
  },
  
  deleteTenant: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/admin/tenants/${id}`);
  },
};

