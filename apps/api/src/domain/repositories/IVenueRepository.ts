import { Venue } from "../entities/Venue.js";

export interface IVenueRepository {
  /**
   * Save a new or updated venue
   */
  save(venue: Venue): Promise<void>;

  /**
   * Find a venue by ID
   */
  findById(id: string): Promise<Venue | null>;

  /**
   * Find a venue by slug and tenant ID
   */
  findBySlugAndTenantId(slug: string, tenantId: string): Promise<Venue | null>;

  /**
   * Find all venues for a tenant
   */
  findByTenantId(tenantId: string): Promise<Venue[]>;

  /**
   * Delete a venue
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a venue exists
   */
  exists(id: string): Promise<boolean>;
}

