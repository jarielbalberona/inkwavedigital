import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { venues } from "./venues.js";

/**
 * Venue Photos - Photo gallery for venues (like Google Business photos)
 * Includes logo, cover photo, and multiple venue photos
 */
export const venuePhotos = pgTable("venue_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  
  // Photo details
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // Optimized thumbnail
  caption: text("caption"),
  altText: text("alt_text"), // For accessibility
  
  // Photo type and categorization
  photoType: text("photo_type").notNull().default("gallery"), // logo, cover, gallery, menu, food, interior, exterior, team, product
  category: text("category"), // Additional categorization (e.g., "breakfast-items", "ambiance")
  
  // Photo metadata
  isPrimary: boolean("is_primary").notNull().default(false), // Primary photo for the type
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  
  // Attribution (if uploaded by customers or staff)
  uploadedBy: uuid("uploaded_by"), // User ID
  uploadedByType: text("uploaded_by_type"), // 'staff', 'customer', 'owner'
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

