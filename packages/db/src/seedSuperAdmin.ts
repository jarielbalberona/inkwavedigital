import { createDbConnection } from "./index.js";
import { superAdmins, auditLogs } from "./schema/index.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave";

const seedSuperAdmin = async () => {
  const db = createDbConnection(connectionString);

  console.log("⏳ Seeding super admins...");

  // Get super admin emails from environment
  const superAdminEmails = [
    process.env.SUPER_ADMIN_EMAIL_1,
    process.env.SUPER_ADMIN_EMAIL_2,
    process.env.SUPER_ADMIN_EMAIL_3,
  ].filter(Boolean);

  if (superAdminEmails.length === 0) {
    console.log("⚠️  No super admin emails found in environment variables");
    console.log("Set SUPER_ADMIN_EMAIL_1, SUPER_ADMIN_EMAIL_2, etc.");
    process.exit(0);
  }

  console.log(`📧 Found ${superAdminEmails.length} super admin email(s)`);

  for (const email of superAdminEmails) {
    try {
      // Check if super admin already exists
      const existingAdmin = await db.query.superAdmins.findFirst({
        where: (admins, { eq }) => eq(admins.email, email!),
      });

      if (existingAdmin) {
        console.log(`ℹ️  Super admin already exists: ${email}`);
        continue;
      }

      // For seeding, we need to have these users created in Clerk first
      // We'll need to get the clerkUserId somehow
      // For now, we'll create a placeholder that requires manual update
      
      console.log(`⚠️  Cannot create super admin for ${email} automatically`);
      console.log(`   Manual steps required:`);
      console.log(`   1. Create user in Clerk with email: ${email}`);
      console.log(`   2. Get the clerk_user_id from Clerk`);
      console.log(`   3. Run SQL: INSERT INTO super_admins (clerk_user_id, email, role, status) VALUES ('<clerk_user_id>', '${email}', 'super_admin', 'active')`);
      
    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error);
    }
  }

  console.log("\n✅ Super admin seeding completed!");
  console.log("\n📋 Next steps:");
  console.log("1. Ensure users exist in Clerk with the specified emails");
  console.log("2. Get clerk_user_id for each user from Clerk");
  console.log("3. Manually insert into super_admins table with clerk_user_id");
  console.log("\nExample SQL:");
  console.log("INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)");
  console.log("VALUES ('user_abc123', 'admin@inkwave.com', 'super_admin', 'active', '{}');");
  
  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  console.error("❌ Super admin seeding failed!");
  console.error(err);
  process.exit(1);
});

