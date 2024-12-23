import { createTool } from "@mastra/core";
import { Document, LlamaParseReader } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  buffer: z.instanceof(ArrayBuffer),
  fileName: z.string(),
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
  execute: async ({ context: c, mastra }) => {
    const reader = new LlamaParseReader({
      resultType: "markdown",
      apiKey: process.env.LLAMA_CLOUD_API_KEY!,
    });

    const content = new Uint8Array(c.buffer);

    const chunkedDocuments = await reader.loadDataAsContent(
      content,
      c.fileName,
    );

    mastra?.logger?.debug(
      JSON.stringify({ type: "CUSTOM_LOG", chunkedDocuments }),
    );

    return { chunkedDocuments };
  },
});
