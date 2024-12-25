import { Step } from "@mastra/core";
import { PgVector } from "@mastra/rag";
import { z } from "zod";

export const retrieveSourceMaterial = new Step({
  id: "retrieveSourceMarerial",
  description: "Retrieves source materials for podcast generation",
  inputSchema: z.object({
    notebookId: z.string(),
  }),
  outputSchema: z.object({
    sources: z.array(
      z.object({
        content: z.string(),
        metadata: z.object({
          title: z.string(),
          summary: z.string(),
          keyTopics: z.array(z.string()),
        }),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const pgVector = new PgVector(process.env.DB_URL!);
    const indexName = context.notebookId.replaceAll("-", "_");

    try {
      const stats = await pgVector.describeIndex(indexName);

      const queryVector = new Array(stats.dimension).fill(0);
      const results = await pgVector.query(indexName, queryVector);

      await pgVector.disconnect();

      return {
        indexName,
        stats,
        sources: results.map((result) => ({
          content: result.metadata?.text ?? "",
          metadata: {
            title: result.metadata?.title ?? "",
            summary: result.metadata?.summary ?? "",
            keyTopics: result.metadata?.keyTopics ?? [],
          },
        })),
      };
    } catch (error) {
      await pgVector.disconnect();

      if (error instanceof Error) {
        throw new Error("Could not retrieve source material" + error.message);
      }
      throw new Error("Could not retrieve source material");
    }
  },
});
