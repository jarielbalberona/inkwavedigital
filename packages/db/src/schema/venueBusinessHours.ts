import { pgTable, uuid, text, timestamp, integer, boolean, time } from "drizzle-orm/pg-core";
import { venues } from "./venues.js";

/**
 * Venue Business Hours - Operating hours for each day of the week
 * Supports multiple time slots per day (e.g., lunch and dinner service)
 */
export const venueBusinessHours = pgTable("venue_business_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  
  // Day of week (0 = Sunday, 6 = Saturday) - following JavaScript Date convention
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  
  // Time slots
  openTime: time("open_time"), // HH:MM:SS format (e.g., "09:00:00")
  closeTime: time("close_time"), // HH:MM:SS format (e.g., "22:00:00")
  
  // Special cases
  isClosed: boolean("is_closed").notNull().default(false), // Closed all day
  is24Hours: boolean("is_24_hours").notNull().default(false), // Open 24 hours
  
  // Multiple time slots per day (e.g., lunch 11-2, dinner 5-10)
  slotType: text("slot_type"), // 'regular', 'breakfast', 'lunch', 'dinner', 'happy-hour'
  slotLabel: text("slot_label"), // Display name for the slot
  
  // Ordering
  sortOrder: integer("sort_order").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Venue Special Hours - Override regular hours for holidays, special events
 */
export const venueSpecialHours = pgTable("venue_special_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  
  // Date and time
  date: timestamp("date").notNull(), // Specific date
  openTime: time("open_time"),
  closeTime: time("close_time"),
  
  // Special cases
  isClosed: boolean("is_closed").notNull().default(false),
  is24Hours: boolean("is_24_hours").notNull().default(false),
  
  // Description
  reason: text("reason"), // "Christmas Day", "New Year's Eve", "Private Event"
  notes: text("notes"), // Additional information
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

