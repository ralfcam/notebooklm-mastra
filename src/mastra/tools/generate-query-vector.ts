import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { z } from "zod";

export const generateQueryVector = createTool({
  id: "generate-query-vector",
  description: "Generate query vector from a given query",
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ context: c }) => {
    const queryVector = await embed(c.query, {
      provider: "OPEN_AI",
      model: "text-embedding-ada-002",
      maxRetries: 5,
    });

    return { queryVector };
  },
});
