-- Migration: Add staff_notes and cancellation_reason columns to orders table
-- Add support for internal staff notes and order cancellation tracking

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "staff_notes" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;

