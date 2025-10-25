import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave";

const runMigrations = async () => {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("⏳ Running migrations...");

  await migrate(db, { migrationsFolder: "./migrations" });

  console.log("✅ Migrations completed!");

  await client.end();
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed!");
  console.error(err);
  process.exit(1);
});

