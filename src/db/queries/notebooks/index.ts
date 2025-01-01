import { db } from "@/db";
import { notebooks } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const fetchNotebooks = async () => {
  return await db.select().from(notebooks);
};

export const fetchNavbarName = async (notebookId: string) => {
  return await db
    .select({ name: notebooks.name })
    .from(notebooks)
    .where(eq(notebooks.id, notebookId));
};
