"use server";

import { notebooks } from "@/db/schema/notebooks";
import { actionClient } from "./safe-action";
import { z } from "zod";

export const createNotebookAction = actionClient
  .metadata({
    name: "createNotebookAction",
  })
  .schema(z.object({}).optional())
  .action(async ({ ctx }) => {
    const notebook = await ctx.db.insert(notebooks).values({}).returning();

    return {
      notebookId: notebook[0].id,
    };
  });
