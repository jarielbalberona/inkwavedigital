import { Router } from "express";
import { container } from "tsyringe";
import { MenuController } from "../../../interfaces/controllers/menu.controller.js";

export const menuRouter = Router();

const menuController = container.resolve(MenuController);

// Get menu for a venue
menuRouter.get("/:venueId", menuController.getMenu.bind(menuController));

