-- Migration: Add pax and notes columns to orders table
-- Add support for party size tracking and order notes

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pax" integer;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "notes" text;

