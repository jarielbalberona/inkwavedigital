import { Venue } from "../entities/Venue.js";
import { Table } from "../entities/Table.js";

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
   * Find all tables for a venue
   */
  findTablesByVenueId(venueId: string): Promise<Table[]>;

  /**
   * Find a table by ID
   */
  findTableById(id: string): Promise<Table | null>;

  /**
   * Save a new or updated table
   */
  saveTable(table: Table): Promise<void>;

  /**
   * Delete a table
   */
  deleteTable(id: string): Promise<void>;

  /**
   * Get the next available table number for a venue
   */
  getNextTableNumber(venueId: string): Promise<number>;

  /**
   * Delete a venue
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a venue exists
   */
  exists(id: string): Promise<boolean>;
}

