ALTER TABLE "image_library" DROP CONSTRAINT "image_library_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "image_library" ALTER COLUMN "uploaded_by" SET DATA TYPE text;