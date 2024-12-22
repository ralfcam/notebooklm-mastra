import { db } from "@/db";
import { sources } from "@/db/schema/sources";
import { eq } from "drizzle-orm";

export const fetchNotebookSources = async (notebookId: string) => {
  return await db
    .select()
    .from(sources)
    .where(eq(sources.notebookId, notebookId));
};
