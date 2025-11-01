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

  await client.end();
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed!");
  console.error(err);
  process.exit(1);
});

