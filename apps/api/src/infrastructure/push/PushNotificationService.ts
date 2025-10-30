import webPush from "web-push";
import { injectable, inject } from "tsyringe";
import type { PushSubscriptionRepository } from "../../domain/repositories/PushSubscriptionRepository.js";
import type { PushSubscription } from "../../domain/entities/PushSubscription.js";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

@injectable()
export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private vapidSubject: string;

  constructor(
    @inject("PushSubscriptionRepository") private pushSubscriptionRepository: PushSubscriptionRepository
  ) {
    // Get VAPID keys from environment
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
    this.vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@inkwave.digital";

    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      console.warn(
        "[PushNotificationService] VAPID keys not configured. Push notifications will not work."
      );
      console.warn(
        "[PushNotificationService] Generate keys with: npx web-push generate-vapid-keys"
      );
    } else {
      // Configure web-push with VAPID keys
      webPush.setVapidDetails(
        this.vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey
      );
      console.log("[PushNotificationService] Initialized with VAPID keys");
    }
  }

  /**
   * Get the public VAPID key for client subscription
   */
  getPublicKey(): string {
    return this.vapidPublicKey;
  }

  /**
   * Send push notification to a specific subscription
   */
  async sendToSubscription(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      console.warn("[PushNotificationService] VAPID keys not configured, skipping push");
      return false;
    }

    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      };

      await webPush.sendNotification(
        pushSubscription,
        JSON.stringify(payload),
        {
          TTL: 3600, // Time to live: 1 hour
        }
      );

      // Update last used timestamp
      await this.pushSubscriptionRepository.updateLastUsed(subscription.endpoint);

      console.log(`[PushNotificationService] Sent notification to ${subscription.endpoint}`);
      return true;
    } catch (error: any) {
      console.error("[PushNotificationService] Failed to send notification:", error);

      // If subscription is no longer valid (410 Gone), remove it
      if (error.statusCode === 410) {
        console.log(
          `[PushNotificationService] Subscription expired, removing: ${subscription.endpoint}`
        );
        await this.pushSubscriptionRepository.deleteByEndpoint(subscription.endpoint);
      }

      return false;
    }
  }

  /**
   * Send push notification to all subscriptions for a device
   */
  async sendToDevice(deviceId: string, payload: PushNotificationPayload): Promise<number> {
    const subscriptions = await this.pushSubscriptionRepository.findByDeviceId(deviceId);
    let successCount = 0;

    for (const subscription of subscriptions) {
      const success = await this.sendToSubscription(subscription, payload);
      if (success) successCount++;
    }

    console.log(
      `[PushNotificationService] Sent to ${successCount}/${subscriptions.length} device subscriptions`
    );
    return successCount;
  }

  /**
   * Send push notification to all subscriptions for a user (dashboard)
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<number> {
    const subscriptions = await this.pushSubscriptionRepository.findByUserId(userId);
    let successCount = 0;

    for (const subscription of subscriptions) {
      const success = await this.sendToSubscription(subscription, payload);
      if (success) successCount++;
    }

    console.log(
      `[PushNotificationService] Sent to ${successCount}/${subscriptions.length} user subscriptions`
    );
    return successCount;
  }

  /**
   * Send push notification to all subscriptions for a venue (all staff)
   */
  async sendToVenue(venueId: string, payload: PushNotificationPayload): Promise<number> {
    const subscriptions = await this.pushSubscriptionRepository.findByVenueId(venueId);
    let successCount = 0;

    for (const subscription of subscriptions) {
      const success = await this.sendToSubscription(subscription, payload);
      if (success) successCount++;
    }

    console.log(
      `[PushNotificationService] Sent to ${successCount}/${subscriptions.length} venue subscriptions`
    );
    return successCount;
  }

  /**
   * Broadcast to multiple recipients
   */
  async broadcast(
    recipients: {
      deviceIds?: string[];
      userIds?: string[];
      venueIds?: string[];
    },
    payload: PushNotificationPayload
  ): Promise<number> {
    let totalSuccess = 0;

    if (recipients.deviceIds) {
      for (const deviceId of recipients.deviceIds) {
        totalSuccess += await this.sendToDevice(deviceId, payload);
      }
    }

    if (recipients.userIds) {
      for (const userId of recipients.userIds) {
        totalSuccess += await this.sendToUser(userId, payload);
      }
    }

    if (recipients.venueIds) {
      for (const venueId of recipients.venueIds) {
        totalSuccess += await this.sendToVenue(venueId, payload);
      }
    }

    return totalSuccess;
  }
}

