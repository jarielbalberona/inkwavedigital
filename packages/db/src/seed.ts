import { createDbConnection } from "./index.js";
import { tenants, venues, tables } from "./schema/index.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave";

const seed = async () => {
  const db = createDbConnection(connectionString);

  console.log("⏳ Seeding database...");

  // Check if demo tenant already exists
  const existingTenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, "demo-cafe"),
  });

  let tenant;
  if (existingTenant) {
    console.log("ℹ️  Demo tenant already exists, using existing data");
    tenant = existingTenant;
  } else {
    // Create demo tenant
    [tenant] = await db
      .insert(tenants)
      .values({
        name: "Demo Café",
        slug: "demo-cafe",
        settingsJson: { theme: "default" },
      })
      .returning();
    console.log("✅ Created tenant:", tenant.name);
  }

  // Check if demo venue already exists
  const existingVenue = await db.query.venues.findFirst({
    where: (venues, { eq, and }) => 
      and(eq(venues.tenantId, tenant.id), eq(venues.slug, "branch-1")),
  });

  let venue;
  if (existingVenue) {
    console.log("ℹ️  Demo venue already exists, using existing data");
    venue = existingVenue;
  } else {
    // Create demo venue
    [venue] = await db
      .insert(venues)
      .values({
        tenantId: tenant.id,
        name: "Demo Café Branch 1",
        slug: "branch-1",
        address: "123 Main Street, Bacolod City",
        timezone: "Asia/Manila",
      })
      .returning();
    console.log("✅ Created venue:", venue.name);
  }

  // Check if tables already exist
  const existingTables = await db.query.tables.findMany({
    where: (tables, { eq }) => eq(tables.venueId, venue.id),
  });

  if (existingTables.length > 0) {
    console.log(`ℹ️  Found ${existingTables.length} existing tables, skipping table creation`);
  } else {
    // Create demo tables
    const tableLabels = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"];
    
    for (const label of tableLabels) {
      await db.insert(tables).values({
        venueId: venue.id,
        label,
        isActive: true,
      });
    }
    console.log("✅ Created", tableLabels.length, "tables");
  }

  console.log("✅ Seeding completed!");
  console.log(`📊 Tenant ID: ${tenant.id}`);
  console.log(`📊 Venue ID: ${venue.id}`);

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed!");
  console.error(err);
  process.exit(1);
});

