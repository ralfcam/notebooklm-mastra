import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as sourcesSchema from "./schema/sources";
import * as notebookSchema from "./schema/notebooks";

const client = new Pool({
  connectionString: process.env.DB_URL!,
});

export const db = drizzle({
  client,
  logger: process.env.NODE_ENV === "production" ? false : true,
  schema: { ...sourcesSchema, ...notebookSchema },
});
