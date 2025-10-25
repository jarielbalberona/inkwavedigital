import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";

export const ordersRouter = Router();

const orderController = container.resolve(OrderController);

// Create new order
ordersRouter.post("/", orderController.create.bind(orderController));

// Update order status
ordersRouter.patch("/:id/status", orderController.updateStatus.bind(orderController));

