import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { z } from "zod";

export const generateEmbeddings = createTool({
  id: "generate-embeddings",
  description: "Generate embeddings for vector storage",
  inputSchema: z.object({
    chunks: z.array(z.any()),
  }),
  execute: async ({ context: c }) => {
    const embeddings = await embed(c.chunks, {
      provider: "OPEN_AI",
      model: "text-embedding-ada-002",
      maxRetries: 5,
    });

    return { embeddings };
  },
});
