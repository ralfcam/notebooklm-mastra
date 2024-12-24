import { db } from "@/db";
import { sources, sourceTopics } from "@/db/schema/sources";
import { eq } from "drizzle-orm";

export type FetchedNotebookSources = Awaited<
  ReturnType<typeof fetchNotebookSources>
>;

export const fetchNotebookSources = async (notebookId: string) => {
  const res = await db
    .select()
    .from(sources)
    .where(eq(sources.notebookId, notebookId))
    .leftJoin(sourceTopics, eq(sources.id, sourceTopics.sourceId));

  type Sources = typeof sources.$inferSelect;
  type SourceTopic = typeof sourceTopics.$inferSelect;

  const sourcesMap = new Map<
    string,
    Sources & { sourceTopics: SourceTopic[] }
  >();

  res.forEach(({ sources, source_topics }) => {
    if (sourcesMap.has(sources.id)) {
      const prevValue = sourcesMap.get(sources.id);

      if (prevValue) {
        sourcesMap.set(sources.id, {
          ...prevValue,
          sourceTopics: source_topics
            ? [...prevValue.sourceTopics, { ...source_topics }]
            : prevValue.sourceTopics,
        });
      }
    } else {
      sourcesMap.set(sources.id, {
        ...sources,
        sourceTopics: source_topics ? [{ ...source_topics }] : [],
      });
    }
  });

  return sourcesMap.values().toArray();
};
