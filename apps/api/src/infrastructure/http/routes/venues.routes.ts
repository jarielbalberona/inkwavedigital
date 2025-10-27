import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../../../interfaces/controllers/order.controller.js";
import { VenueController } from "../../../interfaces/controllers/venue.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const venuesRouter = Router();

const orderController = container.resolve(OrderController);
const venueController = container.resolve(VenueController);

// PROTECTED - CRUD operations for venues
venuesRouter.get("/", requireAuth, venueController.getVenues.bind(venueController));
venuesRouter.post("/", requireAuth, venueController.createVenue.bind(venueController));
venuesRouter.put("/:venueId", requireAuth, venueController.updateVenue.bind(venueController));
venuesRouter.delete("/:venueId", requireAuth, venueController.deleteVenue.bind(venueController));

// PUBLIC - Get venue info with tenant details (customers may need this)
venuesRouter.get("/:venueId/info", venueController.getVenueInfo.bind(venueController));

// PROTECTED - Get orders for a venue (KDS/staff only)
venuesRouter.get("/:venueId/orders", requireAuth, orderController.getVenueOrders.bind(orderController));

// PUBLIC - Get tables for a venue (customers need this for QR codes)
venuesRouter.get("/:venueId/tables", venueController.getTables.bind(venueController));

// PROTECTED - Table CRUD operations
venuesRouter.post("/:venueId/tables", requireAuth, venueController.createTable.bind(venueController));
venuesRouter.put("/tables/:tableId", requireAuth, venueController.updateTable.bind(venueController));
venuesRouter.delete("/tables/:tableId", requireAuth, venueController.deleteTable.bind(venueController));

