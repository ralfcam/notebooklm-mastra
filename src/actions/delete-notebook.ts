"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { notebooks } from "@/db/schema/notebooks";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const deleteNotebookAction = actionClient
  .metadata({
    name: "deleteNotebookAction",
  })
  .schema(
    z.object({
      notebookId: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    await ctx.db
      .delete(notebooks)
      .where(eq(notebooks.id, parsedInput.notebookId));

    revalidatePath("/");
  });
