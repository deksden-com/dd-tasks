import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://dd_tasks@127.0.0.1:55433/dd_tasks_foundation_local",
  },
  out: "./apps/api/drizzle",
  schema: "./apps/api/src/db/schema.ts",
});
