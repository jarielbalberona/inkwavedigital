import { Router } from "express";
import { container } from "tsyringe";
import { MenuController } from "../../../interfaces/controllers/menu.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const menuRouter = Router();

const menuController = container.resolve(MenuController);

// PUBLIC - Get menu for a venue (customers need this)
menuRouter.get("/:venueId", menuController.getMenu.bind(menuController));

// PUBLIC - Get categories for a venue (customers need this)
menuRouter.get("/:venueId/categories", menuController.getCategories.bind(menuController));

// PUBLIC - Get menu items by category (customers need this)
menuRouter.get("/categories/:categoryId/items", menuController.getCategoryItems.bind(menuController));

// PROTECTED - Create category for a venue
menuRouter.post("/:venueId/categories", requireAuth, menuController.createCategory.bind(menuController));

// PROTECTED - Update category
menuRouter.patch("/categories/:categoryId", requireAuth, menuController.updateCategory.bind(menuController));

// PROTECTED - Delete category
menuRouter.delete("/categories/:categoryId", requireAuth, menuController.deleteCategory.bind(menuController));

// PROTECTED - Create menu item
menuRouter.post("/items", requireAuth, menuController.createMenuItem.bind(menuController));

// PUBLIC - Get item options (customers need this)
menuRouter.get("/items/:itemId/options", menuController.getItemOptions.bind(menuController));

// PROTECTED - Create item option
menuRouter.post("/items/:itemId/options", requireAuth, menuController.createItemOption.bind(menuController));

// PROTECTED - Update item option
menuRouter.patch("/options/:optionId", requireAuth, menuController.updateItemOption.bind(menuController));

// PROTECTED - Delete item option
menuRouter.delete("/options/:optionId", requireAuth, menuController.deleteItemOption.bind(menuController));

// PROTECTED - Create option value
menuRouter.post("/options/:optionId/values", requireAuth, menuController.createOptionValue.bind(menuController));

// PROTECTED - Update option value
menuRouter.patch("/option-values/:valueId", requireAuth, menuController.updateOptionValue.bind(menuController));

// PROTECTED - Delete option value
menuRouter.delete("/option-values/:valueId", requireAuth, menuController.deleteOptionValue.bind(menuController));