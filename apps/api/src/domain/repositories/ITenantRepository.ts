import { Tenant } from "../entities/Tenant.js";

export interface ITenantRepository {
  /**
   * Save a new or updated tenant
   */
  save(tenant: Tenant): Promise<void>;

  /**
   * Find a tenant by ID
   */
  findById(id: string): Promise<Tenant | null>;

  /**
   * Find a tenant by slug
   */
  findBySlug(slug: string): Promise<Tenant | null>;

  /**
   * Find all tenants
   */
  findAll(): Promise<Tenant[]>;

  /**
   * Delete a tenant
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a tenant exists
   */
  exists(id: string): Promise<boolean>;
}

