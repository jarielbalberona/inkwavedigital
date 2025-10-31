import { pgTable, uuid, text, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants.js";

/**
 * Enhanced Venues Schema - Google Business Page-like features
 * Includes rich location data, business information, and structured address
 */
export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  
  // Basic Info
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"), // Business description/about
  shortDescription: text("short_description"), // Brief tagline (1-2 sentences)
  
  // Location - Coordinates (for maps and distance calculations)
  latitude: numeric("latitude", { precision: 10, scale: 7 }), // e.g., 14.5995124
  longitude: numeric("longitude", { precision: 10, scale: 7 }), // e.g., 120.9842195
  
  // Structured Address (better than single text field)
  addressLine1: text("address_line1"), // Street address
  addressLine2: text("address_line2"), // Building, unit, floor
  city: text("city"),
  state: text("state"), // Province/State
  country: text("country").default("Philippines"),
  postalCode: text("postal_code"),
  formattedAddress: text("formatted_address"), // Full formatted address for display
  
  // Location metadata
  googlePlaceId: text("google_place_id"), // For Google Maps integration
  plusCode: text("plus_code"), // Google Plus Code (for areas without addresses)
  landmark: text("landmark"), // Nearby landmark for easier finding
  
  // Contact Information
  phoneNumber: text("phone_number"),
  alternatePhoneNumber: text("alternate_phone_number"),
  email: text("email"),
  websiteUrl: text("website_url"),
  
  // Business Information
  businessType: text("business_type"), // restaurant, cafe, bakery, bar, food-truck, etc.
  cuisineType: text("cuisine_type"), // Filipino, Japanese, Italian, American, etc.
  priceLevel: integer("price_level"), // 1-4 ($ to $$$$)
  
  // Operating Info
  timezone: text("timezone").notNull().default("Asia/Manila"),
  establishedYear: integer("established_year"), // Year business was established
  
  // Social Media Links (stored as JSONB for flexibility)
  socialLinks: jsonb("social_links"), // { facebook: "url", instagram: "url", twitter: "url", tiktok: "url" }
  
  // Ratings & Reviews (calculated/cached values)
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }), // 0.00 to 5.00
  totalReviews: integer("total_reviews").notNull().default(0),
  totalRating1: integer("total_rating_1").notNull().default(0), // Count of 1-star reviews
  totalRating2: integer("total_rating_2").notNull().default(0),
  totalRating3: integer("total_rating_3").notNull().default(0),
  totalRating4: integer("total_rating_4").notNull().default(0),
  totalRating5: integer("total_rating_5").notNull().default(0),
  
  // Additional Settings (stored as JSONB for future expansion)
  settingsJson: jsonb("settings_json"), // Flexible settings storage
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false), // Verified business
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tables = pgTable("tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  tableNumber: integer("table_number").notNull(), // Incremental number for the table
  name: text("name"), // Optional custom name (e.g., "Window Seat", "Private Room")
  label: text("label").notNull(), // Display label (e.g., "Table 1", "Table A")
  description: text("description"), // Optional description
  capacity: integer("capacity"), // Number of people the table can accommodate
  qrCode: text("qr_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

