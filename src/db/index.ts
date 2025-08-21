import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as sourcesSchema from "./schema/sources";
import * as notebookSchema from "./schema/notebooks";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, {
  logger: process.env.NODE_ENV === "production" ? false : true,
  schema: { ...sourcesSchema, ...notebookSchema },
});