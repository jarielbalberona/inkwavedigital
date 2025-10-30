export interface PushSubscription {
  id: string;
  deviceId?: string;
  venueId?: string;
  userId?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastUsedAt?: Date;
}

