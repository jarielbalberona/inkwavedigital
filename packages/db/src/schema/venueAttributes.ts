import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { venues } from "./venues.js";

/**
 * Venue Attributes - Features, amenities, and characteristics
 * Similar to Google Business attributes (WiFi, parking, accessibility, etc.)
 */
export const venueAttributes = pgTable("venue_attributes", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  
  // Attribute details
  attributeKey: text("attribute_key").notNull(), // e.g., "wifi", "parking", "wheelchair_accessible"
  attributeValue: text("attribute_value"), // Optional value (e.g., "free", "paid", "limited")
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Pre-defined attribute categories and keys:
 * 
 * AMENITIES:
 * - wifi (free, paid, none)
 * - parking (free, paid, street, valet, none)
 * - outdoor_seating
 * - air_conditioning
 * - smoking_area
 * - pet_friendly
 * - restroom
 * 
 * ACCESSIBILITY:
 * - wheelchair_accessible
 * - wheelchair_accessible_entrance
 * - wheelchair_accessible_restroom
 * - wheelchair_accessible_seating
 * - braille_menu
 * 
 * PAYMENT:
 * - accepts_credit_cards
 * - accepts_debit_cards
 * - accepts_cash_only
 * - accepts_mobile_payment (gcash, maya, etc.)
 * - contactless_payment
 * 
 * SERVICE:
 * - dine_in
 * - takeout
 * - delivery
 * - curbside_pickup
 * - reservations_accepted
 * - walk_ins_accepted
 * - table_service
 * - counter_service
 * 
 * DIETARY:
 * - vegetarian_options
 * - vegan_options
 * - gluten_free_options
 * - halal_food
 * - kosher_food
 * - organic_food
 * 
 * ATMOSPHERE:
 * - casual_atmosphere
 * - romantic_atmosphere
 * - family_friendly
 * - good_for_groups
 * - good_for_kids
 * - quiet_environment
 * - live_music
 * - tvs
 * 
 * SOCIAL:
 * - lgbtq_friendly
 * - women_led
 * - locally_owned
 * - sustainable_practices
 */

