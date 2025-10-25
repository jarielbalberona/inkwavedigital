import { pgTable, uuid, timestamp, integer, text, numeric } from "drizzle-orm/pg-core";
import { users } from "./users";
import { venues } from "./venues";
import { orders } from "./orders";
// Phase 2: Loyalty Points
export const merchantPoints = pgTable("merchant_points", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    balance: integer("balance").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const pointTransactions = pgTable("point_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const pointRules = pgTable("point_rules", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    earnPerPeso: numeric("earn_per_peso", { precision: 10, scale: 2 }).notNull().default("0.1"),
    redeemRate: numeric("redeem_rate", { precision: 10, scale: 2 }).notNull().default("0.1"),
    minRedeem: integer("min_redeem").notNull().default(100),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
