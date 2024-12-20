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
  "Queries the vector database for similar embeddings based on a query vector";

export const queryEmbeddings = createTool({
  id: "queryEmbeddings",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { indexName, queryVector, topK = 10, filter, minScore = 0 } = context;

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

      return { results };
    } catch (error: unknown) {
      await pgVector.disconnect();

      if (error instanceof Error) {
        throw new Error(`Failed to query embeddings: ${error.message}`);
      }
      throw new Error(`Failed to query embeddings: ${String(error)}`);
    }
  },
});
