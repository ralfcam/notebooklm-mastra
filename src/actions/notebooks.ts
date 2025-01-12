"use server";

import { notebooks } from "@/db/schema/notebooks";
import { actionClient } from "./safe-action";
import { z } from "zod";

export const createNotebookAction = actionClient
  .metadata({
    name: "createNotebookAction",
  })
  .schema(z.object({ sessionId: z.string() }))
  .action(async ({ ctx, parsedInput }) => {
    const notebook = await ctx.db
      .insert(notebooks)
      .values({ userId: parsedInput.sessionId })
      .returning();

    return {
      notebookId: notebook[0].id,
    };
  });
