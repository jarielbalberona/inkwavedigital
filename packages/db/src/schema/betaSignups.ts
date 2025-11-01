import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const betaSignups = pgTable("beta_signups", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  establishmentName: text("establishment_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processed: boolean("processed").notNull().default(false), // Whether they've been contacted/processed
});

