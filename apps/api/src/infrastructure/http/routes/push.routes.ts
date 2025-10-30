import { Router } from "express";
import { PushController } from "../../../interfaces/push.controller.js";

const router = Router();

// Get VAPID public key
router.get("/vapid-public-key", PushController.getVapidPublicKey);

// Subscribe to push notifications
router.post("/subscribe", PushController.subscribe);

// Unsubscribe from push notifications
router.post("/unsubscribe", PushController.unsubscribe);

export default router;

