import { Workflow } from "@mastra/core";
import { z } from "zod";
import { parseAndChunkFile, saveSource } from "../tools";

export const processUpload = new Workflow({
  name: "processUpload",
  triggerSchema: z.object({
    buffer: z.instanceof(ArrayBuffer),
    fileName: z.string(),
    notebookId: z.string(),
  }),
})
  .step(parseAndChunkFile, {
    variables: {
      buffer: { step: "trigger", path: "buffer" },
      fileName: { step: "trigger", path: "fileName" },
      notebookId: { step: "trigger", path: "notebookId" },
    },
  })
  .then(saveSource, {
    variables: {
      notebookId: { step: parseAndChunkFile, path: "notebookId" },
      source: { step: parseAndChunkFile, path: "source" },
    },
  })
  .commit();
