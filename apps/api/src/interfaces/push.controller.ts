import { Request, Response } from "express";
import { container } from "tsyringe";
import { SubscribeToPushNotificationsUseCase } from "../application/use-cases/SubscribeToPushNotificationsUseCase.js";
import { UnsubscribeFromPushNotificationsUseCase } from "../application/use-cases/UnsubscribeFromPushNotificationsUseCase.js";
import { PushNotificationService } from "../infrastructure/push/PushNotificationService.js";

export class PushController {
  /**
   * GET /api/push/vapid-public-key
   * Get the public VAPID key for client subscription
   */
  static async getVapidPublicKey(req: Request, res: Response): Promise<void> {
    try {
      const pushService = container.resolve(PushNotificationService);
      const publicKey = pushService.getPublicKey();

      res.json({
        publicKey,
      });
    } catch (error) {
      console.error("[PushController] Error getting VAPID public key:", error);
      res.status(500).json({
        error: "Failed to get VAPID public key",
      });
    }
  }

  /**
   * POST /api/push/subscribe
   * Subscribe to push notifications
   */
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, venueId, userId, subscription, userAgent } = req.body;

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        res.status(400).json({
          error: "Invalid subscription object",
        });
        return;
      }

      const useCase = container.resolve(SubscribeToPushNotificationsUseCase);
      const result = await useCase.execute({
        deviceId,
        venueId,
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: userAgent || req.headers["user-agent"],
      });

      res.json(result);
    } catch (error: any) {
      console.error("[PushController] Error subscribing to push:", error);
      res.status(500).json({
        error: error.message || "Failed to subscribe to push notifications",
      });
    }
  }

  /**
   * POST /api/push/unsubscribe
   * Unsubscribe from push notifications
   */
  static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        res.status(400).json({
          error: "Endpoint is required",
        });
        return;
      }

      const useCase = container.resolve(UnsubscribeFromPushNotificationsUseCase);
      const result = await useCase.execute({ endpoint });

      res.json(result);
    } catch (error: any) {
      console.error("[PushController] Error unsubscribing from push:", error);
      res.status(500).json({
        error: error.message || "Failed to unsubscribe from push notifications",
      });
    }
  }
}

