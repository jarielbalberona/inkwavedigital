import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
export const superAdmins = pgTable("super_admins", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull(),
    role: text("role").notNull().default("super_admin"), // 'super_admin' | 'support' | 'billing_admin'
    permissions: jsonb("permissions").default({}).notNull(),
    addedBy: uuid("added_by").references(() => superAdmins.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"), // 'active' | 'suspended'
    lastLogin: timestamp("last_login"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

