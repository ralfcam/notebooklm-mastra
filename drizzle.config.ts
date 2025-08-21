import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite',
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db',
  },
});
