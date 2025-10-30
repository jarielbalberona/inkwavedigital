import { api } from "../../../lib/api";
import type { SettingsData, UpdateSettingsInput, UpdateSettingsResponse } from "../types/settings.types";
import type { TenantSettings } from "@inkwave/types";

export const settingsApi = {
  getSettings: async (tenantId: string): Promise<SettingsData> => {
    const response = await api.get<{ success: boolean; data: SettingsData }>(
      `/api/v1/admin/tenants/${tenantId}/settings`
    );
    return response.data;
  },

  updateSettings: async (input: UpdateSettingsInput): Promise<UpdateSettingsResponse> => {
    const response = await api.patch<UpdateSettingsResponse>(
      `/api/v1/admin/tenants/${input.tenantId}/settings`,
      { settings: input.settings }
    );
    return response;
  },
};

