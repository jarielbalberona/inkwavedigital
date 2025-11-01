-- Emergency fix: Add missing columns to orders table
-- Run this manually in production database if migrations haven't run yet

-- Add pax column if it doesn't exist
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pax" integer;

-- Add notes column if it doesn't exist  
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "notes" text;

-- Add is_to_go column if it doesn't exist (from migration 0010)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_to_go" boolean DEFAULT false;

-- Add staff_notes column if it doesn't exist (from migration 0011)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "staff_notes" text;

-- Add cancellation_reason column if it doesn't exist (from migration 0011)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;

