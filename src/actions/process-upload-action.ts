"use server";

import { mastra } from "@/mastra";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/notebooks/${notebookId}`);
  return workflowResult.runId;
};
