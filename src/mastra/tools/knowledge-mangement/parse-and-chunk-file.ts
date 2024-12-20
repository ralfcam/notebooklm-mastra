import { createTool } from "@mastra/core";
import { Document, LlamaParseReader } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  file: z.instanceof(File),
});

const outputSchema = z.object({
  chunkedDocuments: z.array(z.instanceof(Document)),
});

const description =
  "Processes uploaded files into markdown-formatted, chunked documents using LlamaIndex parser, preparing them for embedding generation";

export const parseAndChunkFile = createTool({
  id: "parseAndChunkFile",
  description,
  inputSchema,
  outputSchema,
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
