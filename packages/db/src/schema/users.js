import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").unique(),
    email: text("email"),
    role: text("role"), // 'owner', 'manager', 'staff'
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const deviceTokens = pgTable("device_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    deviceId: text("device_id"),
    pushEndpoint: text("push_endpoint").notNull(),
    keysJson: jsonb("keys_json").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
