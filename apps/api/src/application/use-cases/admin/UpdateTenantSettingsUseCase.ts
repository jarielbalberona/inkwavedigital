import { injectable, inject } from "tsyringe";
import type { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { ValidationError } from "../../../shared/errors/domain-error.js";
import type { TenantSettings } from "@inkwave/types";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("update-tenant-settings-use-case");

export interface UpdateTenantSettingsInput {
  tenantId: string;
  settings: TenantSettings;
}

export interface UpdateTenantSettingsOutput {
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings: Record<string, any> | null;
    updatedAt: string;
  };
}

@injectable()
export class UpdateTenantSettingsUseCase {
  constructor(
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async execute(input: UpdateTenantSettingsInput): Promise<UpdateTenantSettingsOutput> {
    logger.info({ tenantId: input.tenantId }, "Updating tenant settings");

    // Get the tenant
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new ValidationError(`Tenant with ID "${input.tenantId}" not found`);
    }

    // Merge existing settings with new settings
    const currentSettings = tenant.settingsJson || {};
    const updatedSettings = {
      ...currentSettings,
      ...input.settings,
    };

    // Update tenant settings (this will validate the settings)
    tenant.updateSettings(updatedSettings);

    // Save the tenant
    await this.tenantRepository.save(tenant);

    logger.info({ tenantId: input.tenantId }, "Tenant settings updated successfully");

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        settings: tenant.settingsJson,
        updatedAt: tenant.updatedAt.toISOString(),
      },
    };
  }
}

