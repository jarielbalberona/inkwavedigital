import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
export const venues = pgTable("venues", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    address: text("address"),
    timezone: text("timezone").notNull().default("Asia/Manila"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const tables = pgTable("tables", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    tableNumber: integer("table_number").notNull(),
    name: text("name"),
    label: text("label").notNull(),
    description: text("description"),
    capacity: integer("capacity"),
    qrCode: text("qr_code"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
