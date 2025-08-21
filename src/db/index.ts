import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as sourcesSchema from "./schema/sources";
import * as notebookSchema from "./schema/notebooks";

const sqlite = new Database(process.env.DB_URL?.replace('file:', '') || './local.db');

export const db = drizzle(sqlite, {
  logger: process.env.NODE_ENV === "production" ? false : true,
  schema: { ...sourcesSchema, ...notebookSchema },
});