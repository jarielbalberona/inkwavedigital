import { injectable, inject } from "tsyringe";
import type { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { ValidationError } from "../../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-tenant-settings-use-case");

export interface GetTenantSettingsInput {
  tenantId: string;
}

export interface GetTenantSettingsOutput {
  settings: Record<string, any> | null;
}

@injectable()
export class GetTenantSettingsUseCase {
  constructor(
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async execute(input: GetTenantSettingsInput): Promise<GetTenantSettingsOutput> {
    logger.info({ tenantId: input.tenantId }, "Getting tenant settings");

    // Get the tenant
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new ValidationError(`Tenant with ID "${input.tenantId}" not found`);
    }

    return {
      settings: tenant.settingsJson,
    };
  }
}

