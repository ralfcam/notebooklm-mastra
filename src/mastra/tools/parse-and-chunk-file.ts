import { createTool } from "@mastra/core";
import { Document, LlamaParseReader } from "llamaindex";
import { z } from "zod";
import { parseAndChunkFileInputSchema } from "./schemas";

export const parseAndChunkFile = createTool({
  id: "parse-and-chunk-file",
  description:
    "Parse uploaded file and return chunked documents ready for embedding.",
  inputSchema: parseAndChunkFileInputSchema,
  outputSchema: z.object({
    chunkedDocuments: z.array(z.instanceof(Document)),
  }),
  execute: async ({ context: c }) => {
    const reader = new LlamaParseReader({ resultType: "markdown" });
    const content = new Uint8Array(await c.file.arrayBuffer());

    const chunkedDocuments = await reader.loadDataAsContent(
      content,
      c.file.name,
    );

    return { chunkedDocuments };
  },
});
