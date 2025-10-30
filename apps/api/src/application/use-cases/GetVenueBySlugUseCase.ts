import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import type { ITenantRepository } from "../../domain/repositories/ITenantRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-venue-by-slug-use-case");

export interface GetVenueBySlugInput {
  tenantSlug: string;
  venueSlug: string;
}

export interface GetVenueBySlugOutput {
  venue: {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    address?: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings?: Record<string, any> | null;
  };
}

@injectable()
export class GetVenueBySlugUseCase {
  constructor(
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async execute(input: GetVenueBySlugInput): Promise<GetVenueBySlugOutput> {
    logger.info({ tenantSlug: input.tenantSlug, venueSlug: input.venueSlug }, "Fetching venue by slugs");

    // Find tenant by slug
    const tenant = await this.tenantRepository.findBySlug(input.tenantSlug);
    if (!tenant) {
      throw new NotFoundError(`Tenant with slug "${input.tenantSlug}"`);
    }

    // Find venue by slug and tenant ID
    const venue = await this.venueRepository.findBySlugAndTenantId(input.venueSlug, tenant.id);
    if (!venue) {
      throw new NotFoundError(`Venue with slug "${input.venueSlug}" for tenant "${input.tenantSlug}"`);
    }

    logger.info({ venueId: venue.id, tenantId: tenant.id }, "Venue found by slugs");

    return {
      venue: venue.toJSON(),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        settings: tenant.settingsJson,
      },
    };
  }
}

