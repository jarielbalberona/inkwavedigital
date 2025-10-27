import { createLogger } from "@inkwave/utils";

const logger = createLogger("clerk-service");

export class ClerkService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.CLERK_SECRET_KEY || "";
    
    if (!this.apiKey) {
      logger.warn("CLERK_SECRET_KEY not set in environment");
    }
  }

  /**
   * Send an invitation to a user via Clerk
   * @param email User's email address
   * @returns Clerk user ID if successful
   */
  async inviteUser(email: string): Promise<string | null> {
    try {
      if (!this.apiKey) {
        logger.error("Clerk API key not configured");
        return null;
      }

      const response = await fetch("https://api.clerk.com/v1/invitations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          public_metadata: {},
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        logger.error({ error, email }, "Failed to invite user via Clerk");
        return null;
      }

      const data = await response.json() as any;
      logger.info({ email, clerkUserId: data.id }, "User invited successfully");

      // Return the invitation ID (will be linked to actual user when they sign up)
      return data.id;
    } catch (error) {
      logger.error({ error, email }, "Error inviting user via Clerk");
      return null;
    }
  }

  /**
   * Create a user directly in Clerk
   * @param email User's email address
   * @returns Clerk user ID if successful
   */
  async createUser(email: string): Promise<string | null> {
    try {
      if (!this.apiKey) {
        logger.error("Clerk API key not configured");
        return null;
      }

      const response = await fetch("https://api.clerk.com/v1/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: [email],
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        logger.error({ error, email }, "Failed to create user via Clerk");
        return null;
      }

      const data = await response.json() as any;
      logger.info({ email, clerkUserId: data.id }, "User created successfully");

      return data.id;
    } catch (error) {
      logger.error({ error, email }, "Error creating user via Clerk");
      return null;
    }
  }
}

