import type { TenantSettings, ColorTheme, FontPairing } from "@inkwave/types";

export interface SettingsData {
  settings: TenantSettings | null;
}

export interface UpdateSettingsInput {
  tenantId: string;
  settings: TenantSettings;
}

export interface UpdateSettingsResponse {
  success: boolean;
  data: {
    tenant: {
      id: string;
      name: string;
      slug: string;
      settings: TenantSettings | null;
      updatedAt: string;
    };
  };
}

export type { TenantSettings, ColorTheme, FontPairing };

