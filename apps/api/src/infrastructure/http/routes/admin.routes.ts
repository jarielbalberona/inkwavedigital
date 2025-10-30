import { Router } from "express";
import { container } from "tsyringe";
import { AdminController } from "../../../interfaces/controllers/admin.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const adminRouter = Router();

const adminController = container.resolve(AdminController);

// For development: Allow all authenticated requests
// In production: Uncomment requireAuth and requireSuperAdmin
adminRouter.use(requireAuth as any);
// adminRouter.use(requireSuperAdmin as any); // TODO: Enable in production

// Tenant management
adminRouter.post("/tenants", adminController.createTenant.bind(adminController));
adminRouter.get("/tenants", adminController.getTenants.bind(adminController));
adminRouter.get("/tenants/:id", adminController.getTenant.bind(adminController));
adminRouter.delete("/tenants/:id", adminController.deleteTenant.bind(adminController));

// Tenant settings
adminRouter.get("/tenants/:id/settings", adminController.getTenantSettings.bind(adminController));
adminRouter.patch("/tenants/:id/settings", adminController.updateTenantSettings.bind(adminController));

