import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
});

const outputSchema = z.object({
  sources: z.array(
    z.object({
      source: z.string(),
      relevance: z.number(),
      contentSnippets: z.array(
        z.object({
          text: z.string(),
          relevance: z.number(),
        }),
      ),
    }),
  ),
});

const description =
  "Organizes search results by source, structuring content snippets and calculating source relevance";

export const organizeSources = createTool({
  id: "organizeSources",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { results } = context;

    try {
      const sourceMap = new Map<
        string,
        {
          source: string;
          relevance: number;
          contentSnippets: Array<{
            text: string;
            relevance: number;
          }>;
        }
      >();

      // Process each search result
      for (const result of results) {
        const source = result.metadata?.source;
        const text = result.metadata?.text;

        if (!source || !text) {
          continue; // Skip results without required metadata
        }

        // Initialize or update source entry
        if (!sourceMap.has(source)) {
          sourceMap.set(source, {
            source,
            relevance: result.score,
            contentSnippets: [],
          });
        }

        const sourceEntry = sourceMap.get(source)!;

        // Add content snippet
        sourceEntry.contentSnippets.push({
          text,
          relevance: result.score,
        });

        // Update source relevance if this result is more relevant
        if (result.score > sourceEntry.relevance) {
          sourceEntry.relevance = result.score;
        }
      }

      // Convert map to array and sort by relevance
      const sources = Array.from(sourceMap.values()).sort(
        (a, b) => b.relevance - a.relevance,
      );

      return {
        sources,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to organize sources: ${error.message}`);
      }
      throw new Error(`Failed to organize sources: ${String(error)}`);
    }
  },
});
