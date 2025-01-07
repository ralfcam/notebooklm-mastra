"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { pollJobStatus } from "@/lib/submit-parse-job";
import { parsingJobs } from "@/db/schema/sources";

export const pollJobStatusAction = actionClient
  .metadata({ name: "pollJobStatusAction" })
  .schema(z.object({ jobId: z.string() }))
  .action(async ({ ctx, parsedInput }) => {
    const response = await pollJobStatus(parsedInput.jobId);

    if (response.status === "SUCCESS") {
      await ctx.db
        .update(parsingJobs)
        .set({ jobId: response.id, status: response.status });
    }

    return response;
  });
