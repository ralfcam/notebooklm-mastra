import {
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { notebooks } from "./notebooks";
import { timestamps } from "./helpers";

export const sourceType = pgEnum("source_type", ["file", "text"]);

export const sources = pgTable(
  "sources",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    type: sourceType("type").notNull(),
    content: text().default("").notNull(),
    summary: text().default("").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    notebookId: uuid("notebook_id")
      .references(() => notebooks.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
  (table) => ({
    embeddingIndex: index("embedding_index").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);

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
