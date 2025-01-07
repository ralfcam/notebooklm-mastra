"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { getJobResultsInMarkdown } from "@/lib/submit-parse-job";

export const summarizeSourceAction = actionClient
  .metadata({ name: "summarizeSourceAction" })
  .schema(z.object({ sourceId: z.string().uuid(), jobId: z.string().uuid() }))
  .action(async ({ ctx, parsedInput }) => {
    //fetch documents from llamaparse
    const res = await getJobResultsInMarkdown(parsedInput.jobId);

    return res;
  });
