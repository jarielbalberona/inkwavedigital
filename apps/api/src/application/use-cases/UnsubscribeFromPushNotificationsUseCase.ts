import type { PushSubscriptionRepository } from "../../domain/repositories/PushSubscriptionRepository.js";

export interface UnsubscribeFromPushNotificationsInput {
  endpoint: string;
}

export interface UnsubscribeFromPushNotificationsOutput {
  success: boolean;
}

export class UnsubscribeFromPushNotificationsUseCase {
  constructor(private pushSubscriptionRepository: PushSubscriptionRepository) {}

  async execute(
    input: UnsubscribeFromPushNotificationsInput
  ): Promise<UnsubscribeFromPushNotificationsOutput> {
    await this.pushSubscriptionRepository.deleteByEndpoint(input.endpoint);

    console.log(`[UnsubscribeFromPushNotifications] Subscription removed for endpoint`);

    return {
      success: true,
    };
  }
}

