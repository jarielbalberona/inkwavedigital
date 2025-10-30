import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { venues } from "./venues.js";
import { users } from "./users.js";

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: text("device_id"), // For customer app subscriptions
  venueId: uuid("venue_id").references(() => venues.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // For dashboard subscriptions
  endpoint: text("endpoint").notNull().unique(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

