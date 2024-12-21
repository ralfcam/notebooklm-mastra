import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";

export const notebooks = pgTable("notebooks", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().default("Untitled Notebook"),
  ...timestamps,
});
