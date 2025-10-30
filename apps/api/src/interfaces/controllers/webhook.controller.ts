import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { clerkClient } from "@clerk/express";
import { Webhook } from "svix";

const logger = createLogger("webhook-controller");

@injectable()
export class WebhookController {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository
  ) {}

  /**
   * Handle Clerk webhook events
   * Supports user.created event to automatically link users and set tenant ID
   */
  async handleClerkWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get webhook signing secret from environment
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

      if (!webhookSecret) {
        logger.error("CLERK_WEBHOOK_SECRET not configured");
        res.status(500).json({ error: "Webhook not configured" });
        return;
      }

      // Get headers for verification
      const svixId = req.headers["svix-id"] as string;
      const svixTimestamp = req.headers["svix-timestamp"] as string;
      const svixSignature = req.headers["svix-signature"] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        logger.warn("Missing svix headers");
        res.status(400).json({ error: "Missing webhook headers" });
        return;
      }

      // Verify webhook signature
      const wh = new Webhook(webhookSecret);
      let evt: any;

      try {
        evt = wh.verify(JSON.stringify(req.body), {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err) {
        logger.error({ err }, "Webhook signature verification failed");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }

      // Handle different event types
      const eventType = evt.type;
      logger.info({ eventType }, "Received Clerk webhook event");

      switch (eventType) {
        case "user.created":
          await this.handleUserCreated(evt.data);
          break;
        case "user.updated":
          await this.handleUserUpdated(evt.data);
          break;
        default:
          logger.info({ eventType }, "Unhandled webhook event type");
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error({ error }, "Error processing webhook");
      next(error);
    }
  }

  /**
   * Handle user.created event from Clerk
   * Links the Clerk user to our database user and sets tenant ID in Clerk metadata
   */
  private async handleUserCreated(data: any): Promise<void> {
    try {
      const clerkUserId = data.id;
      const emailAddresses = data.email_addresses || [];
      const primaryEmail = emailAddresses.find((e: any) => e.id === data.primary_email_address_id);
      const email = primaryEmail?.email_address;

      if (!email) {
        logger.warn({ clerkUserId }, "No email found in user.created event");
        return;
      }

      logger.info({ clerkUserId, email }, "Processing user.created event");

      // Find user by email in our database
      const dbUser = await this.userRepository.findByEmail(email);

      if (!dbUser) {
        logger.info({ email }, "No pre-existing user found in database - user may have self-signed up");
        return;
      }

      // Update our database with clerk user ID if not already set
      if (!dbUser.clerkUserId) {
        await this.userRepository.updateClerkUserId(dbUser.id, clerkUserId);
        logger.info({ userId: dbUser.id, clerkUserId }, "Updated database with Clerk user ID");
      }

      // Set tenant ID in Clerk's publicMetadata if user has a tenant
      if (dbUser.tenantId) {
        await clerkClient.users.updateUser(clerkUserId, {
          publicMetadata: {
            tenantId: dbUser.tenantId,
            role: dbUser.role,
          },
        });
        logger.info(
          { clerkUserId, tenantId: dbUser.tenantId, role: dbUser.role },
          "Updated Clerk user metadata with tenant ID and role"
        );
      } else {
        logger.warn({ clerkUserId, email }, "User has no tenant ID - skipping Clerk metadata update");
      }
    } catch (error) {
      logger.error({ error, data }, "Error handling user.created event");
      throw error;
    }
  }

  /**
   * Handle user.updated event from Clerk
   * Sync any relevant changes
   */
  private async handleUserUpdated(data: any): Promise<void> {
    try {
      const clerkUserId = data.id;
      logger.info({ clerkUserId }, "Processing user.updated event");

      // Find user by clerk user ID
      const dbUser = await this.userRepository.findByClerkUserId(clerkUserId);

      if (!dbUser) {
        logger.info({ clerkUserId }, "User not found in database");
        return;
      }

      // Ensure metadata is in sync
      if (dbUser.tenantId) {
        const currentMetadata = data.public_metadata || {};
        
        if (currentMetadata.tenantId !== dbUser.tenantId) {
          await clerkClient.users.updateUser(clerkUserId, {
            publicMetadata: {
              ...currentMetadata,
              tenantId: dbUser.tenantId,
              role: dbUser.role,
            },
          });
          logger.info({ clerkUserId, tenantId: dbUser.tenantId }, "Synced tenant ID to Clerk metadata");
        }
      }
    } catch (error) {
      logger.error({ error, data }, "Error handling user.updated event");
      // Don't throw - we don't want to fail the webhook for sync issues
    }
  }
}

