import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";
import { sources } from "./sources";
import { relations } from "drizzle-orm";

export const notebooks = pgTable("notebooks", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().default("Untitled Notebook").notNull(),
  userId: text("user_id"),
  title: text(),
  summary: text(),
  emoji: text(),
  ...timestamps,
});

export const notebooksRelations = relations(notebooks, (h) => ({
  sources: h.many(sources),
}));
