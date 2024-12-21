"use server";

import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { redirect } from "next/navigation";

export const createNotebook = async () => {
  const notebook = await db.insert(notebooks).values({}).returning();

  if (notebook.length) {
    redirect(`/notebook/${notebook[0].id}`);
  }
};
