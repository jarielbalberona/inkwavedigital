import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../../../interfaces/controllers/auth.controller.js";

export const authRouter = Router();

const authController = container.resolve(AuthController);

// Check if user is super admin
// Note: For development, this endpoint accepts email as query parameter
authRouter.get(
  "/check-super-admin",
  authController.checkSuperAdmin.bind(authController)
);

