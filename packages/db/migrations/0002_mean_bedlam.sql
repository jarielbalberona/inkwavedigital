CREATE TABLE IF NOT EXISTS "venue_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"role" text DEFAULT 'manager' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "venue_staff" ADD CONSTRAINT "venue_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "venue_staff" ADD CONSTRAINT "venue_staff_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
