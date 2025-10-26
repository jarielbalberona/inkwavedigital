import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";
import { VenueController } from "../../../interfaces/controllers/venue.controller.js";

export const venuesRouter = Router();

const orderController = container.resolve(OrderController);
const venueController = container.resolve(VenueController);

// Get orders for a venue
venuesRouter.get("/:venueId/orders", orderController.getVenueOrders.bind(orderController));

// Get tables for a venue
venuesRouter.get("/:venueId/tables", venueController.getTables.bind(venueController));

