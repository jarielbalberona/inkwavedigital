-- Migration: Add venue enhancements (Google Business Page features)
-- Generated manually for venue schema enhancement

-- ============================================================================
-- ALTER VENUES TABLE - Add new columns
-- ============================================================================

-- Basic Info
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "short_description" text;

-- Location & Coordinates
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "latitude" numeric(10, 7);
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "longitude" numeric(10, 7);
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "address_line1" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "address_line2" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "country" text DEFAULT 'Philippines';
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "postal_code" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "formatted_address" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "google_place_id" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "plus_code" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "landmark" text;

-- Contact Information
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "phone_number" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "alternate_phone_number" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "website_url" text;

-- Business Information
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "business_type" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "cuisine_type" text;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "price_level" integer;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "established_year" integer;

-- Social Media
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "social_links" jsonb;

-- Rating Statistics
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "average_rating" numeric(3, 2);
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_reviews" integer DEFAULT 0 NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_rating_1" integer DEFAULT 0 NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_rating_2" integer DEFAULT 0 NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_rating_3" integer DEFAULT 0 NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_rating_4" integer DEFAULT 0 NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "total_rating_5" integer DEFAULT 0 NOT NULL;

-- Settings
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "settings_json" jsonb;

-- Status
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false NOT NULL;

-- Migrate existing address data to formatted_address
UPDATE "venues" SET "formatted_address" = "address" WHERE "address" IS NOT NULL AND "formatted_address" IS NULL;

-- ============================================================================
-- CREATE NEW TABLES
-- ============================================================================

-- Venue Reviews
CREATE TABLE IF NOT EXISTS "venue_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE CASCADE,
	"order_id" uuid REFERENCES "orders"("id") ON DELETE SET NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"user_id" uuid,
	"device_id" text,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"merchant_reply" text,
	"merchant_replied_at" timestamp,
	"merchant_replied_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Review Photos
CREATE TABLE IF NOT EXISTS "review_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL REFERENCES "venue_reviews"("id") ON DELETE CASCADE,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Review Helpful Votes
CREATE TABLE IF NOT EXISTS "review_helpful_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL REFERENCES "venue_reviews"("id") ON DELETE CASCADE,
	"device_id" text,
	"user_id" uuid,
	"is_helpful" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Venue Photos
CREATE TABLE IF NOT EXISTS "venue_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE CASCADE,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"caption" text,
	"alt_text" text,
	"photo_type" text DEFAULT 'gallery' NOT NULL,
	"category" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uploaded_by" uuid,
	"uploaded_by_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Venue Business Hours
CREATE TABLE IF NOT EXISTS "venue_business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE CASCADE,
	"day_of_week" integer NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"is_24_hours" boolean DEFAULT false NOT NULL,
	"slot_type" text,
	"slot_label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Venue Special Hours
CREATE TABLE IF NOT EXISTS "venue_special_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE CASCADE,
	"date" timestamp NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"is_24_hours" boolean DEFAULT false NOT NULL,
	"reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Venue Attributes
CREATE TABLE IF NOT EXISTS "venue_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL REFERENCES "venues"("id") ON DELETE CASCADE,
	"attribute_key" text NOT NULL,
	"attribute_value" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);


