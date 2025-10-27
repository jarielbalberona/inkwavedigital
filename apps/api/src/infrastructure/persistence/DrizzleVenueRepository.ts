import { injectable, inject } from "tsyringe";
import { eq, and, desc } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { venues, tables } from "@inkwave/db";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { Venue } from "../../domain/entities/Venue.js";
import { Table } from "../../domain/entities/Table.js";

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

  async findTablesByVenueId(venueId: string): Promise<Table[]> {
    const results = await this.db.query.tables.findMany({
      where: eq(tables.venueId, venueId),
    });

    return results.map((table) => this.mapTableToEntity(table));
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

  private mapTableToEntity(tableData: any): Table {
    return Table.restore({
      id: tableData.id,
      venueId: tableData.venueId,
      tableNumber: tableData.tableNumber,
      name: tableData.name || undefined,
      label: tableData.label,
      description: tableData.description || undefined,
      capacity: tableData.capacity || undefined,
      qrCode: tableData.qrCode || undefined,
      isActive: tableData.isActive,
      createdAt: new Date(tableData.createdAt),
      updatedAt: new Date(tableData.updatedAt),
    });
  }

  async findTableById(id: string): Promise<Table | null> {
    const result = await this.db.query.tables.findFirst({
      where: eq(tables.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapTableToEntity(result);
  }

  async saveTable(table: Table): Promise<void> {
    const tableData = {
      id: table.id,
      venueId: table.venueId,
      tableNumber: table.tableNumber,
      name: table.name || null,
      label: table.label,
      description: table.description || null,
      capacity: table.capacity || null,
      qrCode: table.qrCode || null,
      isActive: table.isActive,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };

    // Check if table exists
    const existing = await this.db.query.tables.findFirst({
      where: eq(tables.id, table.id),
    });

    if (existing) {
      // Update existing table
      await this.db
        .update(tables)
        .set(tableData)
        .where(eq(tables.id, table.id));
    } else {
      // Insert new table
      await this.db.insert(tables).values(tableData);
    }
  }

  async deleteTable(id: string): Promise<void> {
    await this.db.delete(tables).where(eq(tables.id, id));
  }

  async getNextTableNumber(venueId: string): Promise<number> {
    const result = await this.db
      .select({ maxTableNumber: tables.tableNumber })
      .from(tables)
      .where(eq(tables.venueId, venueId))
      .orderBy(desc(tables.tableNumber))
      .limit(1);

    if (result.length === 0 || !result[0].maxTableNumber) {
      return 1;
    }

    return result[0].maxTableNumber + 1;
  }
}

