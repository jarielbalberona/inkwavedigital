import { injectable, inject, container } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import { DrizzleSuperAdminRepository } from "../../infrastructure/persistence/DrizzleSuperAdminRepository.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { IVenueStaffRepository } from "../../domain/repositories/IVenueStaffRepository.js";
import type { ITenantRepository } from "../../domain/repositories/ITenantRepository.js";

const logger = createLogger("auth-controller");

@injectable()
export class AuthController {
  constructor(
    @inject("DrizzleSuperAdminRepository") private superAdminRepo: DrizzleSuperAdminRepository,
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IVenueStaffRepository") private venueStaffRepository: IVenueStaffRepository,
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async checkSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract email from query parameter (for development)
      // In production, extract from authenticated Clerk token
      const email = req.query.email as string;
      
      if (!email) {
        logger.warn("No email found in request");
        return void res.json({
          success: true,
          data: {
            isSuperAdmin: false,
          },
        });
      }

      // Check if email is in super_admins table
      const admin = await this.superAdminRepo.findByEmail(email);
      const isSuperAdmin = admin !== null;

      logger.info({ email, isSuperAdmin }, "Super admin check completed");

      res.json({
        success: true,
        data: {
          isSuperAdmin,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        logger.warn("No email found in request");
        return void res.json({
          success: true,
          data: {
            tenantId: null,
          },
        });
      }

      const user = await this.userRepository.findByEmail(email);
      const tenantId = user?.tenantId || null;

      logger.info({ email, tenantId }, "Tenant ID lookup completed");

      res.json({
        success: true,
        data: {
          tenantId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        logger.warn("No email found in request");
        return void res.json({
          success: true,
          data: null,
        });
      }

      const user = await this.userRepository.findByEmail(email);
      
      if (!user || !user.tenantId) {
        return void res.json({
          success: true,
          data: null,
        });
      }

      // Get tenant details
      const tenant = await this.tenantRepository.findById(user.tenantId);

      if (!tenant) {
        return void res.json({
          success: true,
          data: null,
        });
      }

      logger.info({ email, tenantId: user.tenantId }, "Tenant info lookup completed");

      res.json({
        success: true,
        data: tenant.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        logger.warn("No email found in request");
        return void res.json({
          success: true,
          data: {
            role: null,
            assignedVenueIds: [],
          },
        });
      }

      // Check if user is a super admin first (super admins may not exist in users table)
      const admin = await this.superAdminRepo.findByEmail(email);
      if (admin) {
        // Super admins don't have assigned venues - they have access to all tenants
        return void res.json({
          success: true,
          data: {
            role: "super_admin",
            assignedVenueIds: [],
          },
        });
      }

      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        // User doesn't exist in database - may be a super admin who signed up directly in Clerk
        // Log at info level instead of warn since this is expected for super admins
        logger.info({ email }, "User not found in database (may be super admin without database record)");
        return void res.json({
          success: true,
          data: {
            role: null,
            assignedVenueIds: [],
          },
        });
      }

      // If user is owner, return empty assignedVenueIds (has access to all venues)
      if (user.role === "owner") {
        return void res.json({
          success: true,
          data: {
            role: "owner",
            assignedVenueIds: [],
          },
        });
      }

      // If user is manager, get assigned venues from venue_staff table
      if (user.role === "manager") {
        const venueStaffRepo = container.resolve<IVenueStaffRepository>("IVenueStaffRepository");
        const assignedVenueIds = await venueStaffRepo.getVenuesByUserId(user.id);
        
        return void res.json({
          success: true,
          data: {
            role: "manager",
            assignedVenueIds,
          },
        });
      }

      // Other roles or no role
      res.json({
        success: true,
        data: {
          role: user.role,
          assignedVenueIds: [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

