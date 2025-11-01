-- Migration: Add support for multiple images on menu items
-- Changes image_url (text) to image_urls (jsonb array)
-- This migration is idempotent and safe to run multiple times

-- Step 1: Add new image_urls column as jsonb (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'image_urls'
    ) THEN
        ALTER TABLE "menu_items" ADD COLUMN "image_urls" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Step 2: Migrate existing image_url data to image_urls array
-- Only migrate if image_url column still exists and image_urls is empty/default
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'image_url'
    ) THEN
        UPDATE "menu_items" 
        SET "image_urls" = jsonb_build_array("image_url")
        WHERE "image_url" IS NOT NULL 
          AND "image_url" != '' 
          AND ("image_urls" IS NULL OR "image_urls" = '[]'::jsonb);
    END IF;
END $$;

-- Step 3: Drop the old image_url column (only if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE "menu_items" DROP COLUMN "image_url";
    END IF;
END $$;

