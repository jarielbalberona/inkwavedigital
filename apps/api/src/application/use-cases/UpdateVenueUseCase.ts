import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";

export interface UpdateVenueInput {
  venueId: string;
  name?: string;
  address?: string;
  timezone?: string;
}

export interface UpdateVenueOutput {
  venue: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    timezone: string;
    updatedAt: string;
  };
}

@injectable()
export class UpdateVenueUseCase {
  constructor(@inject("IVenueRepository") private venueRepository: IVenueRepository) {}

  async execute(input: UpdateVenueInput): Promise<UpdateVenueOutput> {
    const venue = await this.venueRepository.findById(input.venueId);

    if (!venue) {
      throw new Error("Venue not found");
    }

    if (input.name !== undefined) {
      venue.updateName(input.name);
    }

    if (input.address !== undefined) {
      venue.updateAddress(input.address);
    }

    if (input.timezone !== undefined) {
      venue.updateTimezone(input.timezone);
    }

    await this.venueRepository.save(venue);

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        timezone: venue.timezone,
        updatedAt: venue.updatedAt.toISOString(),
      },
    };
  }
}

