import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { venues } from "./venues.js";
import { orders } from "./orders.js";

/**
 * Venue Reviews - Customer reviews for venues with ratings, photos, and merchant replies
 * Similar to Google Business Page reviews
 */
export const venueReviews = pgTable("venue_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }), // Optional: link to order
  
  // Customer info (can be anonymous or linked to user)
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"), // Optional for follow-up
  userId: uuid("user_id"), // Optional: if customer has account
  deviceId: text("device_id"), // For anonymous customers
  
  // Review content
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"), // Optional review title
  comment: text("comment"), // Review text
  
  // Review metadata
  isVerified: boolean("is_verified").notNull().default(false), // Verified purchase/order
  isPublished: boolean("is_published").notNull().default(true), // Can be hidden by admin
  isFlagged: boolean("is_flagged").notNull().default(false), // Flagged for moderation
  
  // Merchant reply
  merchantReply: text("merchant_reply"),
  merchantRepliedAt: timestamp("merchant_replied_at"),
  merchantRepliedBy: uuid("merchant_replied_by"), // User ID of staff who replied
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Review Photos - Photos attached to reviews
 */
export const reviewPhotos = pgTable("review_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => venueReviews.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // Optimized thumbnail
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Review Helpful Votes - Track if reviews were helpful
 */
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => venueReviews.id, { onDelete: "cascade" }),
  deviceId: text("device_id"), // Anonymous voter
  userId: uuid("user_id"), // Authenticated voter
  isHelpful: boolean("is_helpful").notNull(), // true = helpful, false = not helpful
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

