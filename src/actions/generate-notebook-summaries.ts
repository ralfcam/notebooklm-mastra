"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";

export const generateNotebookSummaries = actionClient
  .metadata({
    name: "generateNotebookSummaries",
  })
  .schema(
    z.object({
      notebookId: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const knowledgeManager = ctx.mastra.getAgent("knowledgeManager");

    const { partialObjectStream } = await knowledgeManager.generate(
      `Explore the summaries and sources for the notebook with this id: ${parsedInput.notebookId}`,
      {
        schema: z.object({
          emoji: z
            .string()
            .describe(
              "A single emoji that captures the general idea of the content in this notebook",
            ),
          title: z
            .string()
            .describe(
              "A title that would be fitting for this notebook based on the contents and summaries",
            ),
          summary: z
            .string()
            .describe(
              "A 2-paragraph summary of the sources from this notebook",
            ),
        }),
        stream: true,
      },
    );

    return partialObjectStream;
  });
