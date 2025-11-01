import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../../domain/repositories/IVenueRepository.js";
import type { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IMenuRepository } from "../../../domain/repositories/IMenuRepository.js";
import { Venue } from "../../../domain/entities/Venue.js";
import { Menu } from "../../../domain/entities/Menu.js";
import { Tenant } from "../../../domain/entities/Tenant.js";
import { ValidationError } from "../../../shared/errors/domain-error.js";
import { ClerkService } from "../../../infrastructure/clerk/ClerkService.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("create-tenant-use-case");

export interface CreateTenantInput {
  name: string;
  slug: string;
  ownerEmail?: string;
  settings?: Record<string, any>;
  initialVenue?: {
    name: string;
    slug: string;
    address?: string;
    timezone?: string;
  };
}

export interface CreateTenantOutput {
  tenant: {
    id: string;
    name: string;
    slug: string;
    settings: Record<string, any> | null;
    createdAt: string;
  };
  venue?: {
    id: string;
    name: string;
    slug: string;
  };
}

@injectable()
export class CreateTenantUseCase {
  private clerkService: ClerkService;

  constructor(
    @inject("ITenantRepository") private tenantRepository: ITenantRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {
    this.clerkService = new ClerkService();
  }

  async execute(input: CreateTenantInput): Promise<CreateTenantOutput> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Tenant name is required");
    }

    if (!input.slug || input.slug.trim().length === 0) {
      throw new ValidationError("Tenant slug is required");
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(input.slug)) {
      throw new ValidationError("Tenant slug must contain only lowercase letters, numbers, and hyphens");
    }

    // Check if tenant with this slug already exists
    const existingTenant = await this.tenantRepository.findBySlug(input.slug);
    if (existingTenant) {
      throw new ValidationError(`Tenant with slug "${input.slug}" already exists`);
    }

    // Validate owner email before creating tenant
    if (input.ownerEmail) {
      const existingUser = await this.userRepository.findByEmail(input.ownerEmail);
      if (existingUser && existingUser.tenantId) {
        throw new ValidationError(
          `Email "${input.ownerEmail}" is already associated with another tenant. ` +
          `Each email can only be the owner of one tenant.`
        );
      }
    }

    // Create tenant
    const tenant = Tenant.create({
      name: input.name.trim(),
      slug: input.slug.toLowerCase().trim(),
      settingsJson: input.settings || null,
    });

    await this.tenantRepository.save(tenant);

    // Send invitation to tenant owner if email provided
    if (input.ownerEmail) {
      logger.info({ email: input.ownerEmail, tenantId: tenant.id }, "Processing owner invitation");
      
      // Create user record
      try {
        await this.userRepository.create({
          clerkUserId: null, // Will be set when user signs in
          email: input.ownerEmail,
          role: "owner",
          tenantId: tenant.id,
        });
        logger.info({ email: input.ownerEmail, tenantId: tenant.id }, "User record created");
      } catch (error) {
        logger.error({ error, email: input.ownerEmail }, "Failed to create user record");
        throw error;
      }
      
      // Try to send Clerk invitation (may fail if key not configured)
      const clerkInvitationId = await this.clerkService.inviteUser(input.ownerEmail);
      
      if (clerkInvitationId) {
        logger.info({ clerkInvitationId, email: input.ownerEmail }, "Clerk invitation sent successfully");
      } else {
        logger.warn({ email: input.ownerEmail }, "Failed to send Clerk invitation (may need CLERK_SECRET_KEY)");
      }
    }

    let venue = null;
    
    // Create initial venue if provided
    if (input.initialVenue) {
      venue = Venue.create({
        tenantId: tenant.id,
        name: input.initialVenue.name,
        slug: input.initialVenue.slug,
        address: input.initialVenue.address,
        timezone: input.initialVenue.timezone || "Asia/Manila",
      });

      await this.venueRepository.save(venue);

      // Create default menu for the venue (set as active)
      // This ensures categories can be created immediately
      const defaultMenu = Menu.create({
        venueId: venue.id,
        name: "Main Menu",
        isActive: true,
      });

      await this.menuRepository.saveMenu(defaultMenu);
      logger.info({ venueId: venue.id, menuId: defaultMenu.id }, "Default menu created for initial venue");
    }

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        settings: tenant.settingsJson,
        createdAt: tenant.createdAt.toISOString(),
      },
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
      } : undefined,
    };
  }
}

