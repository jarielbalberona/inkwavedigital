import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { venues, tables } from "./venues";
// Phase 2: Wi-Fi Integration
export const wifiTokens = pgTable("wifi_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    tableId: uuid("table_id").references(() => tables.id, { onDelete: "set null" }),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // pending, used, expired
    macAddress: text("mac_address"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const wifiSessions = pgTable("wifi_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    macAddress: text("mac_address").notNull(),
    tokenId: uuid("token_id").references(() => wifiTokens.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endsAt: timestamp("ends_at").notNull(),
});
