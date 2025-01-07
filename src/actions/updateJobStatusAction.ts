"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { parsingJobs, parsingStatus } from "@/db/schema/sources";

export const updateJobStatusAction = actionClient
  .metadata({ name: "updateJobStatusAction" })
  .schema(
    z.array(
      z.object({
        sourceId: z.string().uuid(),
        jobId: z.string().uuid(),
        status: z.enum(parsingStatus.enumValues),
      }),
    ),
  )
  .action(async ({ ctx, parsedInput }) => {
    return Promise.all(
      parsedInput.map((i) => ctx.db.update(parsingJobs).set(i).returning()),
    );
  });
