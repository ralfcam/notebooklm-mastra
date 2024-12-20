import { createTool } from "@mastra/core";
import { z } from "zod";

export const storeEmbeddings = createTool({
  id: "store-embeddings",
  description:
    "Store embeddings and their associated content chunks to the database.",
  inputSchema: z.object({
    embeddings: z.array(z.array(z.number())),
    chunks: z.array(z.string()),
    sourceId: z.string(),
    metadata: z.array(z.record(z.any())).optional(),
  }),
  execute: async ({ context }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { embeddings, chunks, sourceId } = context;

      if (embeddings.length !== chunks.length) {
        throw new Error("Number of embeddings must match number of chunks");
      }

      // Get results

      return {};
    } catch (error) {
      console.error("Error storing embeddings:", error);
      throw error;
    }
  },
});
