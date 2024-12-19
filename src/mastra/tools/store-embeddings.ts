import { createVectorStore } from "@/lib/vector-store";
import { createTool } from "@mastra/core";
import { z } from "zod";

export const storeEmbeddings = createTool({
  id: "store-embeddings",
  description: "Store embeddings to vector database.",
  inputSchema: z.object({
    embeddings: z.array(z.array(z.number())),
    index_name: z.string().default("podcast_content"),
    metadata: z.array(z.record(z.any())).optional(),
  }),
  execute: async ({ context }) => {
    try {
      const vectorStore = createVectorStore(context.index_name);

      const vectorIds = await vectorStore
        .upsert(context.index_name, context.embeddings, context.metadata)
        .finally(() => vectorStore.disconnect());

      return {
        ok: true,
        vectorIds,
      };
    } catch (error) {
      console.error(error);
    }
  },
});
