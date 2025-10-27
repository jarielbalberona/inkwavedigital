import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import { UnauthorizedError } from "../../shared/errors/domain-error.js";

const logger = createLogger("auth-middleware");

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string;
        email?: string;
      };
      isSuperAdmin?: boolean;
      tenantId?: string;
    }
  }
}

/**
 * Middleware to verify authentication
 * For development: allows any request
 * In production: verify Clerk JWT token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // For development - accept any request
  // In production, implement Clerk token verification
  next();
}

/**
 * Middleware to check if user is a super admin
 * Requires requireAuth to be called first
 */
export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth?.userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // TODO: Check database if user is super admin
    // For now, we'll use environment variable check
    
    // In production, query super_admins table
    // const isSuperAdmin = await checkIsSuperAdmin(req.auth.userId);
    
    // TODO: Query super_admins table
    // For now, we'll use a simple check
    // In production, use DrizzleSuperAdminRepository
    logger.warn({ userId: req.auth.userId, email: req.auth.email }, "⚠️  Mock super admin check - replace with database query");
    
    // Accept for now
    req.isSuperAdmin = true;
    next();
  } catch (error) {
    logger.error({ error }, "Super admin check failed");
    return next(new UnauthorizedError("Super admin verification failed"));
  }
}

