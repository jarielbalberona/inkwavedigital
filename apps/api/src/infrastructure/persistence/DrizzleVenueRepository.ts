import { injectable, inject } from "tsyringe";
import { eq, and } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { venues } from "@inkwave/db";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { Venue } from "../../domain/entities/Venue.js";

@injectable()
export class DrizzleVenueRepository implements IVenueRepository {
  constructor(@inject("Database") private db: Database) {}

  async save(venue: Venue): Promise<void> {
    const venueData = {
      id: venue.id,
      tenantId: venue.tenantId,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      timezone: venue.timezone,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };

    await this.db
      .insert(venues)
      .values(venueData)
      .onConflictDoUpdate({
        target: venues.id,
        set: {
          name: venueData.name,
          address: venueData.address,
          timezone: venueData.timezone,
          updatedAt: venueData.updatedAt,
        },
      });
  }

  async findById(id: string): Promise<Venue | null> {
    const result = await this.db.query.venues.findFirst({
      where: eq(venues.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findBySlugAndTenantId(slug: string, tenantId: string): Promise<Venue | null> {
    const result = await this.db.query.venues.findFirst({
      where: and(eq(venues.slug, slug), eq(venues.tenantId, tenantId)),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findByTenantId(tenantId: string): Promise<Venue[]> {
    const results = await this.db.query.venues.findMany({
      where: eq(venues.tenantId, tenantId),
    });

    return results.map((venue) => this.mapToEntity(venue));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(venues).where(eq(venues.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db.query.venues.findFirst({
      where: eq(venues.id, id),
    });

    return result !== undefined;
  }

  private mapToEntity(venueData: any): Venue {
    return Venue.restore({
      id: venueData.id,
      tenantId: venueData.tenantId,
      name: venueData.name,
      slug: venueData.slug,
      address: venueData.address || undefined,
      timezone: venueData.timezone,
      createdAt: new Date(venueData.createdAt),
      updatedAt: new Date(venueData.updatedAt),
    });
  }
}

