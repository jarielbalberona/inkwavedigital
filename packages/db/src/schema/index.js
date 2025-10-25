import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
// Minimal test table for skeleton
export const healthCheck = pgTable("health_check", {
    id: uuid("id").defaultRandom().primaryKey(),
    status: text("status").notNull().default("ok"),
    checkedAt: timestamp("checked_at").defaultNow().notNull(),
});
// Export all schemas
export * from "./tenants";
export * from "./venues";
export * from "./menus";
export * from "./orders";
export * from "./users";
export * from "./points";
export * from "./wifi";
