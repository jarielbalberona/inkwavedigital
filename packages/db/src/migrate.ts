import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  process.exit(1);
}

const runMigrations = async () => {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("⏳ Running migrations...");

  // Use absolute path in production, relative in development
  const migrationsFolder = process.env.NODE_ENV === "production"
    ? "/app/packages/db/migrations"
    : "./migrations";

  console.log(`📁 Migrations folder: ${migrationsFolder}`);

  await migrate(db, { migrationsFolder });

  console.log("✅ Migrations completed!");

  // Verify critical columns exist and add them if missing (safety check)
  console.log("🔍 Verifying critical columns...");
  try {
    // Check if pax column exists
    const paxCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='pax'
    `;
    
    if (paxCheck.length === 0) {
      console.log("⚠️  Missing 'pax' column detected, adding it...");
      await client`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pax" integer`;
      console.log("✅ Added 'pax' column");
    }

    // Check if notes column exists
    const notesCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='notes'
    `;
    
    if (notesCheck.length === 0) {
      console.log("⚠️  Missing 'notes' column detected, adding it...");
      await client`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "notes" text`;
      console.log("✅ Added 'notes' column");
    }

    // Check if is_to_go column exists
    const isToGoCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='is_to_go'
    `;
    
    if (isToGoCheck.length === 0) {
      console.log("⚠️  Missing 'is_to_go' column detected, adding it...");
      await client`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_to_go" boolean DEFAULT false`;
      console.log("✅ Added 'is_to_go' column");
    }

    // Check if staff_notes column exists
    const staffNotesCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='staff_notes'
    `;
    
    if (staffNotesCheck.length === 0) {
      console.log("⚠️  Missing 'staff_notes' column detected, adding it...");
      await client`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "staff_notes" text`;
      console.log("✅ Added 'staff_notes' column");
    }

    // Check if cancellation_reason column exists
    const cancellationReasonCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='cancellation_reason'
    `;
    
    if (cancellationReasonCheck.length === 0) {
      console.log("⚠️  Missing 'cancellation_reason' column detected, adding it...");
      await client`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancellation_reason" text`;
      console.log("✅ Added 'cancellation_reason' column");
    }

    console.log("✅ Column verification completed!");
  } catch (verifyError) {
    console.error("⚠️  Column verification failed (non-fatal):", verifyError);
    // Don't throw - migrations might still have worked
  }

  await client.end();
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed!");
  console.error(err);
  process.exit(1);
});

