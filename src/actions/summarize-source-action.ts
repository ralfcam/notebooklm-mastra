"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { getJobResultsInMarkdown } from "@/lib/submit-parse-job";

export const summarizeSourceAction = actionClient
  .metadata({ name: "summarizeSourceAction" })
  .schema(z.object({ sourceId: z.string().uuid(), jobId: z.string().uuid() }))
  .action(async ({ ctx, parsedInput }) => {
    try {
      const res = await getJobResultsInMarkdown(parsedInput.jobId);

      if (!res) {
        throw new Error("Something went wrong while getting the job result");
      }

      const workflowResult = await ctx.mastra
        .getWorkflow("summarizeSource")
        .execute({
          triggerData: {
            markdown: res.markdown,
            sourceId: parsedInput.sourceId,
          },
        });

      return workflowResult.results;
    } catch (error) {
      throw error;
    }
  });
