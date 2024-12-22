import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { notebooks } from "./notebooks";
import { timestamps } from "./helpers";

export const sourceType = pgEnum("source_type", ["file", "text"]);

export const sources = pgTable("sources", {
  id: uuid().primaryKey(),
  type: sourceType("type").notNull(),
  notebookId: uuid().references(() => notebooks.id, { onDelete: "cascade" }),
  ...timestamps,
});
