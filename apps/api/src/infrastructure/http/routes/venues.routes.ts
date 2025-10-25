import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";

export const venuesRouter = Router();

const orderController = container.resolve(OrderController);

// Get orders for a venue
venuesRouter.get("/:venueId/orders", orderController.getVenueOrders.bind(orderController));

