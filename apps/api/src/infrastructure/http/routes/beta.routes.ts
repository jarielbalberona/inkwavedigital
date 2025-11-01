import { Router } from "express";
import rateLimit from "express-rate-limit";
import { container } from "tsyringe";
import { BetaController } from "../../../interfaces/controllers/beta.controller.js";

export const betaRouter = Router();

const betaController = container.resolve(BetaController);

// Rate limiter for beta signup (no auth required, so we need strict limits)
const betaSignupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes per IP
  message: {
    success: false,
    error: "Too many signup requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/v1/beta/signup - Public beta signup endpoint
betaRouter.post("/signup", betaSignupLimiter, betaController.signup.bind(betaController));

