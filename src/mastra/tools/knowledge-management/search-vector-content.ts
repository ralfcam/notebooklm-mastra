import { createTool } from "@mastra/core";
import { PgVector } from "@mastra/rag";
import { z } from "zod";

const inputSchema = z.object({
  indexName: z.string(),
  queryVector: z.array(z.number()),
  topK: z.number().optional().default(10),
  filter: z.record(z.any()).optional(),
  minScore: z.number().optional().default(0),
});

const outputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
});

const description =
  "Performs vector similarity search to retrieve relevant content from the knowledge base";

export const searchVectorContent = createTool({
  id: "searchVectorContent",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { indexName, queryVector, topK, filter, minScore } = context;
    const pgVector = new PgVector(process.env.DATABASE_URL!);

    try {
      const results = await pgVector.query(
        indexName,
        queryVector,
        topK,
        filter,
        minScore,
      );

      await pgVector.disconnect();

      return {
        results,
      };
    } catch (error: unknown) {
      await pgVector.disconnect();
      if (error instanceof Error) {
        throw new Error(`Failed to search vector content: ${error.message}`);
      }
      throw new Error(`Failed to search vector content: ${String(error)}`);
    }
  },
});
