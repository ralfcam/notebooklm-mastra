import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export type Notebook = Awaited<ReturnType<typeof fetchNotebooks>>[number];

export const fetchNotebooks = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db.select().from(notebooks).where(eq(notebooks.userId, userId));
};

export const fetchNavbarName = async (notebookId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db
    .select({ name: notebooks.name })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)));
};

export type NotebookSummary = Awaited<
  ReturnType<typeof fetchNotebookSummaries>
>[number];

export const fetchNotebookSummaries = async (notebookId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db
    .select({
      id: notebooks.id,
      emoji: notebooks.emoji,
      title: notebooks.title,
      summary: notebooks.summary,
    })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
    .limit(1);
};
