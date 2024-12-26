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
    const orchestrator = ctx.mastra.getAgent("orchestrator");

    const res = await orchestrator.generate(
      `I'd like you to validate that we have sources available for the notebook with the this notebookId ${parsedInput.triggerData.notebookId} and query the database to get to thoroughly understand the content. Then proceed to work on the podcast. Make sure to include the url in the final response.`,
    );

    console.dir(res, { depth: Infinity });
    return res.text;
  });
