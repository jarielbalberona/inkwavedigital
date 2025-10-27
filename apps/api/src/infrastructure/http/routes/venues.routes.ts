import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";
import { VenueController } from "../../../interfaces/controllers/venue.controller.js";

export const venuesRouter = Router();

const orderController = container.resolve(OrderController);
const venueController = container.resolve(VenueController);

// CRUD operations for venues
venuesRouter.get("/", venueController.getVenues.bind(venueController));
venuesRouter.post("/", venueController.createVenue.bind(venueController));
venuesRouter.put("/:venueId", venueController.updateVenue.bind(venueController));
venuesRouter.delete("/:venueId", venueController.deleteVenue.bind(venueController));

// Get venue info with tenant details
venuesRouter.get("/:venueId/info", venueController.getVenueInfo.bind(venueController));

// Get orders for a venue
venuesRouter.get("/:venueId/orders", orderController.getVenueOrders.bind(orderController));

// Get tables for a venue
venuesRouter.get("/:venueId/tables", venueController.getTables.bind(venueController));

