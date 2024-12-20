import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
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
    topicBalance: z.number(),
    suggestedPace: z.string(),
  }),
  hostConfig: z
    .object({
      hostCount: z.number().optional().default(2),
      hostStyles: z
        .array(
          z.object({
            role: z.string(),
            style: z.enum(["expert", "facilitator", "audience surrogate"]),
            expertise: z.array(z.string()).optional(),
          }),
        )
        .optional(),
    })
    .optional()
    .default({}),
});

const outputSchema = z.object({
  segments: z.array(
    z.object({
      segment: z.number(),
      title: z.string(),
      duration: z.number(),
      hostPoints: z.array(
        z.object({
          hostRole: z.string(),
          points: z.array(
            z.object({
              content: z.string(),
              type: z.enum(["statement", "question", "transition", "evidence"]),
              timing: z.number().optional(),
              followUp: z.array(z.string()).optional(),
            }),
          ),
        }),
      ),
      dynamicElements: z.object({
        questions: z.array(z.string()),
        emphasisMoments: z.array(
          z.object({
            timing: z.number(),
            description: z.string(),
          }),
        ),
      }),
    }),
  ),
  talkingPointsMetadata: z.object({
    interactionCount: z.number(),
    questionDistribution: z.number(), // 0-1 score of how well questions are spread
    averagePointLength: z.number(),
  }),
});

// Schema for structured LLM output
const llmOutputSchema = z.object({
  segments: z.array(
    z.object({
      segment: z.number(),
      title: z.string(),
      duration: z.number(),
      hostPoints: z.array(
        z.object({
          hostRole: z.string(),
          points: z.array(
            z.object({
              content: z.string(),
              type: z.enum(["statement", "question", "transition", "evidence"]),
              timing: z.number().optional(),
              followUp: z.array(z.string()).optional(),
            }),
          ),
        }),
      ),
      dynamicElements: z.object({
        questions: z.array(z.string()),
        emphasisMoments: z.array(
          z.object({
            timing: z.number(),
            description: z.string(),
          }),
        ),
      }),
    }),
  ),
  interactionCount: z.number(),
  questionDistribution: z.number(),
});

const description =
  "Expands episode outline into detailed talking points for each host, including timing and dynamic elements";

export const createTalkingPoints = createTool({
  id: "createTalkingPoints",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context, mastra }) => {
    if (!mastra?.llm) throw new Error("LLM not available");

    const { outline, outlineMetadata, hostConfig } = context;

    try {
      const llm = mastra.llm({
        provider: "ANTHROPIC",
        name: "claude-3-5-sonnet-20241022",
      });

      const result = await llm.generate(
        [
          {
            role: "system",
            content: `You are a podcast script developer creating detailed talking points for ${hostConfig.hostCount} hosts.
            Convert the outline into natural conversational elements, maintaining pacing and engagement.
            Create dynamic interactions between hosts based on their roles and expertise.
            Ensure questions and emphasis moments are strategically placed for audience engagement.`,
          },
          {
            role: "user",
            content: `
              Episode Outline:
              ${outline
                .map(
                  (seg) => `
                Segment ${seg.segment}: ${seg.title}
                Duration: ${seg.duration} seconds
                Main Point: ${seg.mainPoint}
                Base Talking Points: ${seg.talkingPoints.join(", ")}
                Evidence: ${seg.suggestedEvidence.join(", ")}
              `,
                )
                .join("\n")}

              Host Configuration:
              ${hostConfig.hostStyles
                ?.map(
                  (host) => `
                Role: ${host.role}
                Style: ${host.style}
                Expertise: ${host.expertise?.join(", ")}
              `,
                )
                .join("\n")}

              Pacing: ${outlineMetadata.suggestedPace}
              Topic Balance: ${outlineMetadata.topicBalance}
            `,
          },
        ],
        {
          schema: llmOutputSchema,
        },
      );

      const {
        segments,
        interactionCount,
        questionDistribution,
      }: z.infer<typeof llmOutputSchema> = result.object;

      // Calculate average point length
      const allPoints = segments.flatMap((seg) =>
        seg.hostPoints.flatMap((host) =>
          host.points.map((point) => point.content),
        ),
      );
      const averagePointLength =
        allPoints.reduce((acc, point) => acc + point.length, 0) /
        allPoints.length;

      return {
        segments,
        talkingPointsMetadata: {
          interactionCount,
          questionDistribution,
          averagePointLength,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create talking points: ${error.message}`);
      }
      throw new Error(`Failed to create talking points: ${String(error)}`);
    }
  },
});
