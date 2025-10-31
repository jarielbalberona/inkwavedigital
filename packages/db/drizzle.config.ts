import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./dist/schema/**/*.js",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave",
  },
});

