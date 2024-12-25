import { index, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";
import { notebooks } from "./notebooks";
import { timestamps } from "./helpers";

export const sources = pgTable(
  "sources",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    summary: text().default("").notNull(),
    summaryEmbedding: vector("summary_embedding", { dimensions: 1536 }),
    notebookId: uuid("notebook_id")
      .references(() => notebooks.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
  (t) => [
    index("summary_embedding_index").using(
      "ivfflat",
      t.summaryEmbedding.op("vector_cosine_ops"),
    ),
  ],
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

export const sourceChunks = pgTable(
  "source_chunks",
  {
    id: uuid().primaryKey().defaultRandom(),
    content: text().notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    sourceId: uuid("source_id").references(() => sources.id, {
      onDelete: "cascade",
    }),
    ...timestamps,
  },
  (t) => [
    index("chunk_embedding_index").using(
      "ivfflat",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);
