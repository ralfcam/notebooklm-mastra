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

export const parsingStatus = pgEnum("parsing_status", [
  "PENDING",
  "SUCCESS",
  "ERROR",
  "PARTIAL_SUCCESS",
]);

export const processingStatus = pgEnum("processing_status", [
  "queued",
  "parsed",
  "summarized",
  "ready",
  "failed",
]);

export type SourceProcessingStatus =
  (typeof processingStatus.enumValues)[number];

export const parsingJobs = pgTable("parsing_jobs", {
  id: uuid().primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull(),
  sourceId: uuid("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  status: parsingStatus("status").notNull(),
});

export const sources = pgTable(
  "sources",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    summary: text().default(""),
    summaryEmbedding: vector("summary_embedding", { dimensions: 1536 }),
    notebookId: uuid("notebook_id")
      .references(() => notebooks.id, {
        onDelete: "cascade",
      })
      .notNull(),

    processingStatus: processingStatus("processing_status")
      .notNull()
      .default("queued"),
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
    sourceId: uuid("source_id")
      .references(() => sources.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...timestamps,
  },
  (t) => [
    index("chunk_embedding_index").using(
      "ivfflat",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);
