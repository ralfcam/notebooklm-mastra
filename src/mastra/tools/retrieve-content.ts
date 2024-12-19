import { createVectorStore } from "@/lib/vector-store";
import { createTool } from "@mastra/core";
import { z } from "zod";

export const retrieveContent = createTool({
  id: "retrieve-content",
  description: "Retrieve content from the knowledge base",
  inputSchema: z.object({
    queryVector: z.array(z.number()),
    indexName: z.string().default("podcast_content"),
    topK: z.number().default(5),
    minScore: z.number().default(0.7),
    filter: z.record(z.any()).optional(),
  }),
  execute: async ({ context: c }) => {
    const vectorStore = createVectorStore(c.indexName);

    const results = await vectorStore
      .query(c.indexName, c.queryVector, c.topK, c.filter, c.minScore)
      .then((v) => v)
      .finally(() => vectorStore.disconnect());

    return {
      ok: true,
      results,
    };
  },
});
