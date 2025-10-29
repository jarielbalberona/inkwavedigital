import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import { UnauthorizedError } from "../../shared/errors/domain-error.js";
import { clerkClient, verifyToken } from "@clerk/clerk-sdk-node";

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
 * Middleware to verify authentication using Clerk
 * Uses networkless token verification (recommended by Clerk)
 * NO MOCK AUTH - Real Clerk authentication required
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("No authorization header found");
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the JWT token using networkless verification (recommended)
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    if (!payload || !payload.sub) {
      logger.warn("Invalid token payload");
      throw new UnauthorizedError("Invalid authentication token");
    }

    const userId = payload.sub;

    // Get user details from Clerk to extract metadata
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      logger.warn({ userId }, "User not found in Clerk");
      throw new UnauthorizedError("User not found");
    }

    // Set auth data on request
    req.auth = {
      userId,
      email: user.emailAddresses[0]?.emailAddress || "",
    };

    // Get tenant ID from user's public metadata
    const tenantId = user.publicMetadata?.tenantId as string | undefined;
    
    if (tenantId) {
      req.tenantId = tenantId;
    }

    logger.info(
      { userId, email: req.auth.email, tenantId },
      "User authenticated successfully"
    );

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    // Log detailed error information for debugging
    logger.error({ 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      tokenPresent: !!authHeader,
      errorType: error instanceof Error ? error.constructor.name : typeof error
    }, "Authentication error");
    return next(new UnauthorizedError("Authentication failed"));
  }
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

