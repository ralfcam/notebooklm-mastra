import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { Document } from "llamaindex";
import { z } from "zod";

export const generateEmbeddings = createTool({
  id: "generate-embeddings",
  description:
    "Generate embeddings for vector storage from provided chunked documents.",
  inputSchema: z.object({
    chunkedDocuments: z.array(z.string()).or(z.array(z.instanceof(Document))),
  }),
  execute: async ({ context: c }) => {
    const embeddings = await embed(c.chunkedDocuments, {
      provider: "OPEN_AI",
      model: "text-embedding-ada-002",
      maxRetries: 5,
    });

    return { embeddings };
  },
});
