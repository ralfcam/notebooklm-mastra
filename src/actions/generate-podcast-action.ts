"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "./safe-action";
import { z } from "zod";

const inputSchema = z.object({
  triggerData: z.object({
    notebookId: z.string(),
  }),
  pathToRevalidate: z.string(),
});

export const generatePodcastAction = actionClient
  .metadata({ name: "generatePodcastAction" })
  .schema(inputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { mastra } = ctx;
    const { triggerData, pathToRevalidate } = parsedInput;

    const workflowResult = await mastra
      .getWorkflow("generatePodcast")
      .execute({ triggerData });

    if (pathToRevalidate) revalidatePath(pathToRevalidate);

    return workflowResult;
  });
