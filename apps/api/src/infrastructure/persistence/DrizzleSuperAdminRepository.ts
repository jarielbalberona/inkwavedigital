import { injectable, inject } from "tsyringe";
import { eq, and } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { superAdmins } from "@inkwave/db";

export interface SuperAdmin {
  id: string;
  clerkUserId: string;
  email: string;
  role: string;
  status: string;
  permissions: Record<string, any>;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class DrizzleSuperAdminRepository {
  constructor(@inject("Database") private db: Database) {}

  async findByClerkUserId(clerkUserId: string): Promise<SuperAdmin | null> {
    const result = await this.db.query.superAdmins.findFirst({
      where: and(
        eq(superAdmins.clerkUserId, clerkUserId),
        eq(superAdmins.status, "active")
      ),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    const result = await this.db.query.superAdmins.findFirst({
      where: and(
        eq(superAdmins.email, email),
        eq(superAdmins.status, "active")
      ),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findAll(): Promise<SuperAdmin[]> {
    const results = await this.db.query.superAdmins.findMany({
      where: eq(superAdmins.status, "active"),
    });

    return results.map((admin) => this.mapToEntity(admin));
  }

  async create(data: Omit<SuperAdmin, "id" | "createdAt" | "updatedAt">): Promise<SuperAdmin> {
    const result = await this.db.insert(superAdmins).values({
      clerkUserId: data.clerkUserId,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
      status: data.status,
    }).returning();

    return this.mapToEntity(result[0]);
  }

  async updateLastLogin(clerkUserId: string): Promise<void> {
    await this.db.update(superAdmins)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(superAdmins.clerkUserId, clerkUserId));
  }

  private mapToEntity(data: any): SuperAdmin {
    return {
      id: data.id,
      clerkUserId: data.clerkUserId,
      email: data.email,
      role: data.role,
      status: data.status,
      permissions: data.permissions || {},
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

