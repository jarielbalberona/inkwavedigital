import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import { DrizzleSuperAdminRepository } from "../../infrastructure/persistence/DrizzleSuperAdminRepository.js";

const logger = createLogger("auth-controller");

@injectable()
export class AuthController {
  constructor(
    @inject("DrizzleSuperAdminRepository") private superAdminRepo: DrizzleSuperAdminRepository
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
}

