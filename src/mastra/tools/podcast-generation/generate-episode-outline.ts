import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
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
  episodeFormat: z
    .object({
      duration: z.number().optional().default(1800), // Default 30 minutes in seconds
      segments: z.number().optional().default(3),
      style: z
        .enum(["narrative", "conversational", "interview"])
        .optional()
        .default("conversational"),
    })
    .optional()
    .default({}),
});

const outputSchema = z.object({
  outline: z.array(
    z.object({
      segment: z.number(),
      title: z.string(),
      duration: z.number(),
      mainPoint: z.string(),
      talkingPoints: z.array(z.string()),
      transitions: z.object({
        intro: z.string().optional(),
        outro: z.string().optional(),
      }),
      suggestedEvidence: z.array(z.string()),
    }),
  ),
  outlineMetadata: z.object({
    totalDuration: z.number(),
    segmentCount: z.number(),
    topicBalance: z.number(), // 0-1 score of how well distributed topics are
    suggestedPace: z.string(),
  }),
});

// Schema for structured LLM output
const llmOutputSchema = z.object({
  segments: z.array(
    z.object({
      segment: z.number(),
      title: z.string(),
      duration: z.number(),
      mainPoint: z.string(),
      talkingPoints: z.array(z.string()),
      transitions: z.object({
        intro: z.string().optional(),
        outro: z.string().optional(),
      }),
      suggestedEvidence: z.array(z.string()),
    }),
  ),
  topicBalance: z.number(),
  suggestedPace: z.string(),
});

const description =
  "Generates a structured podcast episode outline from main points, including segment timing and transitions";

export const generateEpisodeOutline = createTool({
  id: "generateEpisodeOutline",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context, mastra }) => {
    if (!mastra?.llm) throw new Error("LLM not available");

    const { mainPoints, analysisMetadata, episodeFormat } = context;

    try {
      const llm = mastra.llm({
        provider: "ANTHROPIC",
        name: "claude-3-5-sonnet-20241022",
      });

      // Sort main points by relevance for optimal distribution
      const sortedPoints = [...mainPoints].sort(
        (a, b) => b.relevance - a.relevance,
      );

      const result = await llm.generate(
        [
          {
            role: "system",
            content: `You are a podcast episode planner creating a ${episodeFormat.style} format outline.
            Structure the content into ${episodeFormat.segments} segments totaling ${episodeFormat.duration} seconds.
            Create natural transitions between segments and distribute topics for optimal engagement.
            Ensure talking points are concise and suitable for spoken delivery.`,
          },
          {
            role: "user",
            content: `
              Main Points to Cover:
              ${sortedPoints
                .map(
                  (p) => `
                Point: ${p.point}
                Evidence: ${p.supportingEvidence.join(", ")}
                Related Topics: ${p.relatedTopics.join(", ")}
              `,
                )
                .join("\n")}

              Coverage Analysis:
              Coverage: ${analysisMetadata.coverage}%
              Gaps: ${analysisMetadata.gaps.join(", ")}
              Average Relevance: ${analysisMetadata.averagePointRelevance}
            `,
          },
        ],
        {
          schema: llmOutputSchema,
        },
      );

      const { segments, topicBalance, suggestedPace } = result.object;

      return {
        outline: segments,
        outlineMetadata: {
          totalDuration: episodeFormat.duration,
          segmentCount: segments.length,
          topicBalance,
          suggestedPace,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate episode outline: ${error.message}`);
      }
      throw new Error(`Failed to generate episode outline: ${String(error)}`);
    }
  },
});
