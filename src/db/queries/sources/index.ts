import { db } from "@/db";
import { sources } from "@/db/schema/sources";
import { eq } from "drizzle-orm";

export type FetchedNotebookSource = Awaited<
  ReturnType<typeof fetchNotebookSources>
>[number];

export const fetchNotebookSources = async (notebookId: string) => {
  return await db.query.sources.findMany({
    where: eq(sources.notebookId, notebookId),
    with: {
      sourceSummaries: true,
      sourceTopics: true,
      sourceChunks: true,
      parsingJobs: true,
    },
  });
};
