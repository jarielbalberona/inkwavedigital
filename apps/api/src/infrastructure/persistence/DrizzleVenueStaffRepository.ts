import { injectable, inject } from "tsyringe";
import type { Database } from "@inkwave/db";
import { venueStaff } from "@inkwave/db";
import { eq, and } from "drizzle-orm";
import type { IVenueStaffRepository } from "../../domain/repositories/IVenueStaffRepository.js";
import type { User } from "../../domain/repositories/IUserRepository.js";

@injectable()
export class DrizzleVenueStaffRepository implements IVenueStaffRepository {
  constructor(@inject("Database") private db: Database) {}

  async getVenuesByUserId(userId: string, role?: string): Promise<string[]> {
    const conditions = [eq(venueStaff.userId, userId)];
    if (role) {
      conditions.push(eq(venueStaff.role, role));
    }

    const results = await this.db
      .select({ venueId: venueStaff.venueId })
      .from(venueStaff)
      .where(and(...conditions));

    return results.map((r) => r.venueId);
  }

  async getUsersByVenueId(venueId: string, role?: string): Promise<User[]> {
    const conditions = [eq(venueStaff.venueId, venueId)];
    if (role) {
      conditions.push(eq(venueStaff.role, role));
    }

    const results = await this.db
      .select()
      .from(venueStaff)
      .where(and(...conditions));

    // TODO: Join with users table to get full user data
    // For now, return mock data structure
    return results.map((r) => ({
      id: r.userId,
      clerkUserId: null,
      email: "",
      role: "",
      tenantId: null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async assignStaffToVenue(userId: string, venueId: string, role: string): Promise<void> {
    await this.db.insert(venueStaff).values({
      userId,
      venueId,
      role,
    });
  }

  async removeStaffFromVenue(userId: string, venueId: string): Promise<void> {
    await this.db
      .delete(venueStaff)
      .where(and(eq(venueStaff.userId, userId), eq(venueStaff.venueId, venueId)));
  }

  async updateStaffRole(userId: string, venueId: string, role: string): Promise<void> {
    await this.db
      .update(venueStaff)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(venueStaff.userId, userId), eq(venueStaff.venueId, venueId)));
  }

  async hasAccessToVenue(userId: string, venueId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: venueStaff.id })
      .from(venueStaff)
      .where(and(eq(venueStaff.userId, userId), eq(venueStaff.venueId, venueId)))
      .limit(1);

    return result.length > 0;
  }

  async getAccessibleVenues(userId: string, tenantId: string, userRole: string): Promise<string[]> {
    // If user is owner, they have access to all venues in tenant (will be handled in use case)
    if (userRole === "owner") {
      return [];
    }

    // For managers, return only venues they're assigned to
    return this.getVenuesByUserId(userId);
  }
}

