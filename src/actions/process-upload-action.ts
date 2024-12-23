"use server";

import { mastra } from "@/mastra";

export const parseAndChunkFileAction = async (
  buffer: ArrayBuffer,
  fileName: string,
  notebookId: string,
) => {
  const workflowResult = await mastra.getWorkflow("processUpload").execute({
    triggerData: {
      buffer,
      fileName,
      notebookId,
    },
  });

  return workflowResult.runId;
};
