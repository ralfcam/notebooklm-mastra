import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
  synthesis: z.string(),
  topicFlow: z.array(z.string()),
  contextMetadata: z.object({
    keyTopics: z.array(z.string()),
    totalSources: z.number(),
    averageRelevance: z.number(),
  }),
  targetPoints: z.number().optional().default(5),
});

const outputSchema = z.object({
  mainPoints: z.array(
    z.object({
      point: z.string(),
      relevance: z.number(),
      supportingEvidence: z.array(z.string()),
      relatedTopics: z.array(z.string()),
    }),
  ),
  analysisMetadata: z.object({
    coverage: z.number(),
    gaps: z.array(z.string()),
    averagePointRelevance: z.number(),
  }),
});

// Schema for structured LLM output
const llmOutputSchema = z.object({
  mainPoints: z.array(
    z.object({
      point: z.string(),
      relevance: z.number(),
      supportingEvidence: z.array(z.string()),
      relatedTopics: z.array(z.string()),
    }),
  ),
  coverage: z.number(),
  gaps: z.array(z.string()),
});

const description =
  "Extracts and prioritizes main points from synthesized content, ensuring coverage of key topics and maintaining relevance scoring";

export const extractMainPoints = createTool({
  id: "extractMainPoints",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context, mastra }) => {
    if (!mastra?.llm) throw new Error("LLM not available");

    const { synthesis, topicFlow, contextMetadata, targetPoints } = context;

    try {
      const llm = mastra.llm({
        provider: "ANTHROPIC",
        name: "claude-3-5-sonnet-20241022",
      });

      const result = await llm.generate(
        [
          {
            role: "system",
            content: `You are a content analyzer extracting main points for a podcast script. 
            Extract ${targetPoints} key points from the synthesis, ensuring alignment with topic flow 
            and key topics. Each point should have supporting evidence and maintain relevance scoring.
            Focus on points that will be compelling in spoken format.`,
          },
          {
            role: "user",
            content: `
              Synthesis:
              ${synthesis}

              Topic Flow:
              ${topicFlow.join("\n")}

              Key Topics:
              ${contextMetadata.keyTopics.join("\n")}
            `,
          },
        ],
        {
          schema: llmOutputSchema,
        },
      );

      const { mainPoints, coverage, gaps }: z.infer<typeof llmOutputSchema> =
        result.object;

      // Calculate average point relevance
      const averagePointRelevance =
        mainPoints.reduce((acc, point) => acc + point.relevance, 0) /
        mainPoints.length;

      return {
        mainPoints,
        analysisMetadata: {
          coverage,
          gaps,
          averagePointRelevance,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract main points: ${error.message}`);
      }
      throw new Error(`Failed to extract main points: ${String(error)}`);
    }
  },
});
