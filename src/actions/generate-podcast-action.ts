"use server";

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
    const { fullStream } = await ctx.mastra
      .getAgent("orchestrator")
      .generate(
        `Validate that we have sources available for the notebook with the this notebookId ${parsedInput.triggerData.notebookId}. Follow all previous instructions and create a podcast.`,
        { stream: true },
      );

    return { output: fullStream };
  });
