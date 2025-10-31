import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const ordersRouter = Router();

const orderController = container.resolve(OrderController);

// PUBLIC - Create new order (customers need this)
ordersRouter.post("/", orderController.create.bind(orderController));

// PUBLIC - Get orders by device ID (customers need this to track their orders)
ordersRouter.get("/device/:deviceId", orderController.getDeviceOrders.bind(orderController));

// PROTECTED - Update order status (KDS/staff only)
ordersRouter.patch("/:id/status", requireAuth, orderController.updateStatus.bind(orderController));

// PROTECTED - Update order staff notes (KDS/staff only)
ordersRouter.patch("/:id/staff-notes", requireAuth, orderController.updateStaffNotes.bind(orderController));

