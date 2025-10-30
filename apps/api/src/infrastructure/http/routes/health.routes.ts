import { Router } from "express";
import { container } from "tsyringe";
import { HealthController } from "../../../interfaces/controllers/health.controller.js";

export const healthRouter = Router();

const healthController = container.resolve(HealthController);

// Simple health check
healthRouter.get("/", healthController.check.bind(healthController));

// Detailed health check with metrics
healthRouter.get("/detailed", healthController.detailed.bind(healthController));

// Kubernetes/Docker readiness probe
healthRouter.get("/ready", healthController.ready.bind(healthController));

// Kubernetes/Docker liveness probe
healthRouter.get("/live", healthController.live.bind(healthController));

