import { Router } from "express";
import { container } from "tsyringe";
import { WebhookController } from "../../../interfaces/controllers/webhook.controller.js";
import express from "express";

export const webhookRouter = Router();

const webhookController = container.resolve(WebhookController);

/**
 * Clerk webhook endpoint
 * Important: This endpoint needs raw body for signature verification
 * DO NOT use express.json() middleware before this route
 */
webhookRouter.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res, next) => {
    // Convert raw buffer to JSON for processing
    try {
      const bodyString = req.body.toString();
      req.body = JSON.parse(bodyString);
      await webhookController.handleClerkWebhook(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

