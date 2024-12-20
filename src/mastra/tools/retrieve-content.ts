import { createTool } from "@mastra/core";
import { z } from "zod";
import { searchSimilarChunks } from "@/utils/db";
import { embed } from "@mastra/rag";

export const retrieveContent = createTool({
  id: "retrieve-content",
  description: "Retrieve relevant content from the knowledge base using semantic search",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(5),
  }),
  execute: async ({ context }) => {
    try {
      // Generate embedding for the query
      const queryEmbeddings = await embed([context.query], {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 3,
      });

      // Search for similar chunks
      const results = await searchSimilarChunks(
        queryEmbeddings[0], 
        context.limit
      );

      return {
        results: results.map(({ chunk, similarity }) => ({
          content: chunk.content,
          similarity,
          source: {
            id: chunk.source.id,
            name: chunk.source.name,
            type: chunk.source.type,
            url: chunk.source.url,
          }
        }))
      };
    } catch (error) {
      console.error("Error retrieving content:", error);
      throw error;
    }
  },
});
