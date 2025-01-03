import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { eq } from "drizzle-orm";

export type Notebook = Awaited<ReturnType<typeof fetchNotebooks>>[number];

export const fetchNotebooks = async () => {
  return await db.select().from(notebooks);
};

export const fetchNavbarName = async (notebookId: string) => {
  return await db
    .select({ name: notebooks.name })
    .from(notebooks)
    .where(eq(notebooks.id, notebookId));
};
