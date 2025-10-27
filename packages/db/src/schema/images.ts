import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants.js";

export const imageLibrary = pgTable("image_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  size: integer("size").notNull(), // bytes
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  uploadedBy: text("uploaded_by"), // Clerk user ID (e.g., user_xxx)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

