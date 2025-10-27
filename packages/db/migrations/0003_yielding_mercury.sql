CREATE TABLE IF NOT EXISTS "image_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_categories" ADD COLUMN "icon_url" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_library" ADD CONSTRAINT "image_library_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_library" ADD CONSTRAINT "image_library_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
