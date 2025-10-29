-- Migration: Add support for multiple images on menu items
-- Changes image_url (text) to image_urls (jsonb array)

-- Step 1: Add new image_urls column as jsonb
ALTER TABLE "menu_items" ADD COLUMN "image_urls" jsonb DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing image_url data to image_urls array
-- If image_url is not null and not empty, wrap it in an array
UPDATE "menu_items" 
SET "image_urls" = jsonb_build_array("image_url")
WHERE "image_url" IS NOT NULL AND "image_url" != '';

-- Step 3: Drop the old image_url column
ALTER TABLE "menu_items" DROP COLUMN "image_url";

