import { Router } from "express";
import { container } from "tsyringe";
import { MenuController } from "../../../interfaces/controllers/menu.controller.js";

export const menuRouter = Router();

const menuController = container.resolve(MenuController);

// Get menu for a venue
menuRouter.get("/:venueId", menuController.getMenu.bind(menuController));

// Get categories for a venue
menuRouter.get("/:venueId/categories", menuController.getCategories.bind(menuController));

// Create category for a venue
menuRouter.post("/:venueId/categories", menuController.createCategory.bind(menuController));

// Update category
menuRouter.patch("/categories/:categoryId", menuController.updateCategory.bind(menuController));

// Delete category
menuRouter.delete("/categories/:categoryId", menuController.deleteCategory.bind(menuController));

// Create menu item
menuRouter.post("/items", menuController.createMenuItem.bind(menuController));

// Get menu items by category
menuRouter.get("/categories/:categoryId/items", menuController.getCategoryItems.bind(menuController));