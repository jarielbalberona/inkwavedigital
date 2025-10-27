import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"), // Can be clerkUserId or system
  action: text("action").notNull(), // 'tenant.created', 'admin.added', etc.
  entityType: text("entity_type").notNull(), // 'tenant', 'super_admin', 'user', etc.
  entityId: text("entity_id"), // ID of the affected entity
  metadata: jsonb("metadata").default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

