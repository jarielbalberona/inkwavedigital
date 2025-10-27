import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Minimal test table for skeleton
export const healthCheck = pgTable("health_check", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: text("status").notNull().default("ok"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// Export all schemas
export * from "./tenants.js";
export * from "./venues.js";
export * from "./menus.js";
export * from "./orders.js";
export * from "./users.js";
export * from "./points.js";
export * from "./wifi.js";
export * from "./superAdmins.js";
export * from "./auditLogs.js";
export * from "./venueStaff.js";
export * from "./images.js";

