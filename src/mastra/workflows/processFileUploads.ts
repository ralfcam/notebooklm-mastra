import { Workflow } from "@mastra/core";
import { z } from "zod";
import { parseAndChunkFile } from "../tools";

export const processFileUploads = new Workflow({
  name: "processFileUploads",
  triggerSchema: z.object({
    buffer: z.instanceof(ArrayBuffer),
    fileName: z.string(),
  }),
})
  .step(parseAndChunkFile, {
    variables: {
      buffer: { step: "trigger", path: "buffer" },
      fileName: { step: "trigger", path: "fileName" },
    },
  })
  .commit();
