import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { betaSignups } from "@inkwave/db";
import type { IBetaSignupRepository } from "../../domain/repositories/IBetaSignupRepository.js";

@injectable()
export class DrizzleBetaSignupRepository implements IBetaSignupRepository {
  constructor(@inject("Database") private db: Database) {}

  async create(data: { email: string; establishmentName: string }): Promise<{ id: string; email: string; establishmentName: string; createdAt: Date }> {
    const [result] = await this.db
      .insert(betaSignups)
      .values({
        email: data.email.toLowerCase().trim(),
        establishmentName: data.establishmentName.trim(),
      })
      .returning();

    return {
      id: result.id,
      email: result.email,
      establishmentName: result.establishmentName,
      createdAt: result.createdAt,
    };
  }

  async findByEmail(email: string): Promise<{ id: string; email: string; establishmentName: string; createdAt: Date } | null> {
    const result = await this.db.query.betaSignups.findFirst({
      where: eq(betaSignups.email, email.toLowerCase().trim()),
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      email: result.email,
      establishmentName: result.establishmentName,
      createdAt: result.createdAt,
    };
  }
}

