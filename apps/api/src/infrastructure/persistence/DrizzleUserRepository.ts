import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { users } from "@inkwave/db";
import type { IUserRepository, User, CreateUserInput } from "../../domain/repositories/IUserRepository.js";

@injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@inject("Database") private db: Database) {}

  async create(input: CreateUserInput): Promise<User> {
    const userData = {
      clerkUserId: input.clerkUserId,
      email: input.email,
      role: input.role,
      tenantId: input.tenantId,
    };

    const result = await this.db.insert(users).values(userData).returning();
    return this.mapToEntity(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const results = await this.db.query.users.findMany({
      where: eq(users.tenantId, tenantId),
    });

    return results.map((user) => this.mapToEntity(user));
  }

  async updateClerkUserId(userId: string, clerkUserId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ clerkUserId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  private mapToEntity(userData: any): User {
    return {
      id: userData.id,
      clerkUserId: userData.clerkUserId || null,
      email: userData.email || "",
      role: userData.role || "",
      tenantId: userData.tenantId || null,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    };
  }
}

