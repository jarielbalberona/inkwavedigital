import { randomUUID } from "crypto";
import { PushSubscriptionRepository } from "../../domain/repositories/PushSubscriptionRepository.js";
import { PushSubscription } from "../../domain/entities/PushSubscription.js";

export interface SubscribeToPushNotificationsInput {
  deviceId?: string;
  venueId?: string;
  userId?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface SubscribeToPushNotificationsOutput {
  success: boolean;
  subscriptionId: string;
}

export class SubscribeToPushNotificationsUseCase {
  constructor(private pushSubscriptionRepository: PushSubscriptionRepository) {}

  async execute(
    input: SubscribeToPushNotificationsInput
  ): Promise<SubscribeToPushNotificationsOutput> {
    // Validate that at least one identifier is provided
    if (!input.deviceId && !input.userId) {
      throw new Error("Either deviceId or userId must be provided");
    }

    const subscription: PushSubscription = {
      id: randomUUID(),
      deviceId: input.deviceId,
      venueId: input.venueId,
      userId: input.userId,
      endpoint: input.endpoint,
      keys: input.keys,
      userAgent: input.userAgent,
    };

    await this.pushSubscriptionRepository.save(subscription);

    console.log(
      `[SubscribeToPushNotifications] Subscription saved for ${input.deviceId ? `device: ${input.deviceId}` : `user: ${input.userId}`}`
    );

    return {
      success: true,
      subscriptionId: subscription.id,
    };
  }
}

