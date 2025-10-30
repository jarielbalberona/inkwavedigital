import { PushSubscription } from "../entities/PushSubscription.js";

export interface PushSubscriptionRepository {
  save(subscription: PushSubscription): Promise<void>;
  findByDeviceId(deviceId: string): Promise<PushSubscription[]>;
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByVenueId(venueId: string): Promise<PushSubscription[]>;
  deleteByEndpoint(endpoint: string): Promise<void>;
  updateLastUsed(endpoint: string): Promise<void>;
}

