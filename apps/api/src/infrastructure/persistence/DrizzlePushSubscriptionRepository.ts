import { and, eq, or } from "drizzle-orm";
import { PushSubscriptionRepository } from "../../domain/repositories/PushSubscriptionRepository.js";
import { PushSubscription } from "../../domain/entities/PushSubscription.js";
import { pushSubscriptions } from "@inkwave/db";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class DrizzlePushSubscriptionRepository implements PushSubscriptionRepository {
  constructor(private db: PostgresJsDatabase<Record<string, never>>) {}

  async save(subscription: PushSubscription): Promise<void> {
    const existing = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      await this.db
        .update(pushSubscriptions)
        .set({
          deviceId: subscription.deviceId,
          venueId: subscription.venueId,
          userId: subscription.userId,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userAgent: subscription.userAgent,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    } else {
      // Insert new subscription
      await this.db.insert(pushSubscriptions).values({
        id: subscription.id,
        deviceId: subscription.deviceId,
        venueId: subscription.venueId,
        userId: subscription.userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userAgent: subscription.userAgent,
      });
    }
  }

  async findByDeviceId(deviceId: string): Promise<PushSubscription[]> {
    const results = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.deviceId, deviceId));

    return results.map(this.toDomain);
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    const results = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    return results.map(this.toDomain);
  }

  async findByVenueId(venueId: string): Promise<PushSubscription[]> {
    const results = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.venueId, venueId));

    return results.map(this.toDomain);
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async updateLastUsed(endpoint: string): Promise<void> {
    await this.db
      .update(pushSubscriptions)
      .set({ lastUsedAt: new Date() })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  private toDomain(row: any): PushSubscription {
    return {
      id: row.id,
      deviceId: row.deviceId,
      venueId: row.venueId,
      userId: row.userId,
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dhKey,
        auth: row.authKey,
      },
      userAgent: row.userAgent,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastUsedAt: row.lastUsedAt,
    };
  }
}

