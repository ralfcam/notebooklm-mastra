"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "./safe-action";
import { z } from "zod";

const inputSchema = z.object({
  triggerData: z.object({
    buffer: z.instanceof(ArrayBuffer),
    fileName: z.string(),
    notebookId: z.string(),
  }),
  pathToRevalidate: z.string().optional(),
});

export const processUploadAction = actionClient
  .metadata({ name: "parseUploadAction" })
  .schema(inputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { mastra } = ctx;
    const { pathToRevalidate, triggerData } = parsedInput;

    await mastra.getWorkflow("processUpload").execute({
      triggerData,
    });

    if (pathToRevalidate) revalidatePath(pathToRevalidate);
  });
