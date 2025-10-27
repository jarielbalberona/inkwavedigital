import { injectable, inject } from "tsyringe";
import { eq } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { tenants } from "@inkwave/db";
import type { ITenantRepository } from "../../domain/repositories/ITenantRepository.js";
import { Tenant } from "../../domain/entities/Tenant.js";

@injectable()
export class DrizzleTenantRepository implements ITenantRepository {
  constructor(@inject("Database") private db: Database) {}

  async save(tenant: Tenant): Promise<void> {
    const tenantData = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      settingsJson: tenant.settingsJson,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };

    await this.db
      .insert(tenants)
      .values(tenantData)
      .onConflictDoUpdate({
        target: tenants.id,
        set: {
          name: tenantData.name,
          settingsJson: tenantData.settingsJson,
          updatedAt: tenantData.updatedAt,
        },
      });
  }

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const result = await this.db.query.tenants.findFirst({
      where: eq(tenants.slug, slug),
    });

    if (!result) {
      return null;
    }

    return this.mapToEntity(result);
  }

  async findAll(): Promise<Tenant[]> {
    const results = await this.db.query.tenants.findMany();
    return results.map((tenant) => this.mapToEntity(tenant));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tenants).where(eq(tenants.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });

    return result !== undefined;
  }

  private mapToEntity(tenantData: any): Tenant {
    return Tenant.restore({
      id: tenantData.id,
      name: tenantData.name,
      slug: tenantData.slug,
      settingsJson: tenantData.settingsJson,
      createdAt: new Date(tenantData.createdAt),
      updatedAt: new Date(tenantData.updatedAt),
    });
  }
}

