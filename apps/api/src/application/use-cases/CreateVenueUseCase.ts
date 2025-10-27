import { injectable, inject } from "tsyringe";
import { Venue } from "../../domain/entities/Venue.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";

export interface CreateVenueInput {
  tenantId: string;
  name: string;
  slug: string;
  address?: string;
  timezone?: string;
}

export interface CreateVenueOutput {
  venue: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
}

@injectable()
export class CreateVenueUseCase {
  constructor(@inject("IVenueRepository") private venueRepository: IVenueRepository) {}

  async execute(input: CreateVenueInput): Promise<CreateVenueOutput> {
    // Check if venue with same slug already exists for this tenant
    const existingVenue = await this.venueRepository.findBySlugAndTenantId(
      input.slug,
      input.tenantId
    );

    if (existingVenue) {
      throw new Error("A venue with this slug already exists for this tenant");
    }

    const venue = Venue.create({
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      address: input.address,
      timezone: input.timezone || "Asia/Manila",
    });

    await this.venueRepository.save(venue);

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        timezone: venue.timezone,
        createdAt: venue.createdAt.toISOString(),
        updatedAt: venue.updatedAt.toISOString(),
      },
    };
  }
}

