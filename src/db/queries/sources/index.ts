import { db } from "@/db";
import { sourceChunks, sources, sourceTopics } from "@/db/schema/sources";
import { eq, sql } from "drizzle-orm";

export type FetchedNotebookSource = Awaited<
  ReturnType<typeof fetchNotebookSources>
>[number];

export const fetchNotebookSources = async (notebookId: string) => {
  const chunks = sql<
    { content: string }[]
  >`array_agg(json_build_object('content', ${sourceChunks.content})) filter (where ${sourceChunks.content} is not null)`.as(
    "chunks",
  );
  const topics = sql<
    string[]
  >`array_agg(distinct ${sourceTopics.topic}) filter (where ${sourceTopics.topic} is not null)`.as(
    "topics",
  );

  return await db
    .select({
      sourceId: sources.id,
      sourceName: sources.name,
      sourceSummary: sources.summary,
      notebookId: sources.notebookId,
      sourceTopics: topics,
      sourceChunks: chunks,
    })
    .from(sources)
    .where(eq(sources.notebookId, notebookId))
    .leftJoin(sourceTopics, eq(sources.id, sourceTopics.sourceId))
    .leftJoin(sourceChunks, eq(sourceChunks.sourceId, sources.id))
    .groupBy(sources.id, sources.name, sources.summary, sources.notebookId);
};
