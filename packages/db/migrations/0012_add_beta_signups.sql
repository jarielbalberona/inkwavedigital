-- Migration: Add beta_signups table for landing page beta signup form
-- Stores email and establishment name for beta testers

CREATE TABLE IF NOT EXISTS "beta_signups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "establishment_name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "processed" boolean DEFAULT false NOT NULL
);

CREATE INDEX IF NOT EXISTS "beta_signups_email_idx" ON "beta_signups" ("email");

