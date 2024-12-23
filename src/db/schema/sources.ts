import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { notebooks } from "./notebooks";
import { timestamps } from "./helpers";

export const sourceType = pgEnum("source_type", ["file", "text"]);

export const sources = pgTable("sources", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  type: sourceType("type").notNull(),
  content: text().default("").notNull(),
  summary: text().default("").notNull(),
  notebookId: uuid("notebook_id")
    .references(() => notebooks.id, {
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});

export const sourceTopics = pgTable("source_topics", {
  id: uuid().primaryKey().defaultRandom(),
  topic: text("topic"),
  sourceId: uuid("source_id")
    .references(() => sources.id, {
      onDelete: "cascade",
    })
    .notNull(),
  ...timestamps,
});
