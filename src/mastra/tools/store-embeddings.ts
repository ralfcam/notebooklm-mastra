import { addChunkWithEmbedding } from "@/utils/db";
import { createTool } from "@mastra/core";
import { z } from "zod";

export const storeEmbeddings = createTool({
  id: "store-embeddings",
  description: "Store embeddings and their associated content chunks to the database.",
  inputSchema: z.object({
    embeddings: z.array(z.array(z.number())),
    chunks: z.array(z.string()),
    sourceId: z.string(),
    metadata: z.array(z.record(z.any())).optional(),
  }),
  execute: async ({ context }) => {
    try {
      const { embeddings, chunks, sourceId } = context;
      
      if (embeddings.length !== chunks.length) {
        throw new Error("Number of embeddings must match number of chunks");
      }

      const results = await Promise.all(
        chunks.map((content, index) => 
          addChunkWithEmbedding({
            content,
            sourceId,
            embedding: embeddings[index]
          })
        )
      );

      return {
        ok: true,
        storedChunks: results.length,
        chunkIds: results.map(result => result.id)
      };
    } catch (error) {
      console.error("Error storing embeddings:", error);
      throw error;
    }
  },
});
