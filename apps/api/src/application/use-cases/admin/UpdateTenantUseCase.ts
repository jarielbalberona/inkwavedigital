import { inject, injectable } from "tsyringe";
import type { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { ValidationError } from "../../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("update-tenant-use-case");

export interface UpdateTenantInput {
  tenantId: string;
  name?: string;
  slug?: string;
}

export interface UpdateTenantOutput {
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings: Record<string, unknown> | null;
    updatedAt: string;
  };
}

@injectable()
export class UpdateTenantUseCase {
  constructor(
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async execute(input: UpdateTenantInput): Promise<UpdateTenantOutput> {
    logger.info({ tenantId: input.tenantId }, "Updating tenant");

    // Get the tenant
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new ValidationError(`Tenant with ID "${input.tenantId}" not found`);
    }

    // Update name if provided
    if (input.name !== undefined) {
      tenant.updateName(input.name);
    }

    // Update slug if provided
    if (input.slug !== undefined) {
      // Check if slug is already taken by another tenant
      const existingTenant = await this.tenantRepository.findBySlug(input.slug);
      if (existingTenant && existingTenant.id !== tenant.id) {
        throw new ValidationError(`Slug "${input.slug}" is already taken`);
      }
      
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(input.slug)) {
        throw new ValidationError("Slug can only contain lowercase letters, numbers, and hyphens");
      }

      tenant.updateSlug(input.slug);
    }

    // Save the tenant
    await this.tenantRepository.save(tenant);

    logger.info({ tenantId: input.tenantId }, "Tenant updated successfully");

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

