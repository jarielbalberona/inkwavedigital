import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { venues, tenants } from "@inkwave/db";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-venue-info-use-case");

export interface GetVenueInfoInput {
  venueId: string;
}

export interface GetVenueInfoOutput {
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

@injectable()
export class GetVenueInfoUseCase {
  constructor(@inject("Database") private db: Database) {}

  async execute(input: GetVenueInfoInput): Promise<GetVenueInfoOutput> {
    logger.info({ venueId: input.venueId }, "Fetching venue info");

    // Get venue
    const venue = await this.db.query.venues.findFirst({
      where: eq(venues.id, input.venueId),
    });

    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Get tenant information
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, venue.tenantId),
    });

    if (!tenant) {
      throw new NotFoundError("Tenant");
    }

    logger.info({ venueId: input.venueId, venueName: venue.name }, "Venue info fetched successfully");

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      },
    };
  }
}