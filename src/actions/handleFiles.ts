"use server";

import { mastra } from "@/mastra";

export const parseAndChunkFileAction = async (
  buffer: ArrayBuffer,
  fileName: string,
) => {
  const workflowResult = await mastra
    .getWorkflow("processFileUploads")
    .execute({
      triggerData: {
        buffer,
        fileName,
      },
    });

  console.log({ workflowResult });

  return workflowResult.runId;
};
