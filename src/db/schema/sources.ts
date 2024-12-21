import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

export const sourceType = pgEnum("source_type", ["file", "text"]);

export const sources = pgTable("sources", {
  id: uuid().primaryKey(),
  type: sourceType("type").notNull(),
});
