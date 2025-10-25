import { Router } from "express";
import { container } from "tsyringe";
import { HealthController } from "../../../interfaces/controllers/health.controller.js";

export const healthRouter = Router();

const healthController = container.resolve(HealthController);

healthRouter.get("/", healthController.check.bind(healthController));

