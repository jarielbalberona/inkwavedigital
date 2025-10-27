import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";

export interface GetVenuesInput {
  tenantId: string;
}

export interface GetVenuesOutput {
  venues: Array<{
    id: string;
    name: string;
    slug: string;
    address?: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

@injectable()
export class GetVenuesUseCase {
  constructor(@inject("IVenueRepository") private venueRepository: IVenueRepository) {}

  async execute(input: GetVenuesInput): Promise<GetVenuesOutput> {
    const venues = await this.venueRepository.findByTenantId(input.tenantId);

    return {
      venues: venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        timezone: venue.timezone,
        createdAt: venue.createdAt.toISOString(),
        updatedAt: venue.updatedAt.toISOString(),
      })),
    };
  }
}

