import { pgTable, uuid, text, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { venues, tables } from "./venues.js";
import { menuItems } from "./menus.js";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  tableId: uuid("table_id").references(() => tables.id, { onDelete: "set null" }),
  status: text("status").notNull().default("NEW"), // NEW, PREPARING, READY, SERVED, CANCELLED
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  deviceId: text("device_id"),
  pax: integer("pax"), // number of people
  notes: text("notes"), // order notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").references(() => menuItems.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  optionsJson: jsonb("options_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderEvents = pgTable("order_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: uuid("created_by"),
});

