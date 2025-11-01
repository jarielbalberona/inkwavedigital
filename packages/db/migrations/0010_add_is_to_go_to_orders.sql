-- Migration: Add is_to_go field to orders table
-- This field indicates whether the order is for takeout (true) or dine-in (false)

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_to_go" boolean DEFAULT false;

