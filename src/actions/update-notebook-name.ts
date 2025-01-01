"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { notebooks } from "@/db/schema/notebooks";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateNotebookNameAction = actionClient
  .metadata({
    name: "updateNotebookNameAction",
  })
  .schema(
    z.object({
      name: z.string(),
      notebookId: z.string().uuid(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const res = await ctx.db
      .update(notebooks)
      .set(parsedInput)
      .where(eq(notebooks.id, parsedInput.notebookId))
      .returning({ name: notebooks.name });

    revalidatePath(`/notebook/${parsedInput.notebookId}`);

    return res;
  });
