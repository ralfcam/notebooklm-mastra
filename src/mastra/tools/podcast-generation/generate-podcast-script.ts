import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
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
    questionDistribution: z.number(),
    averagePointLength: z.number(),
  }),
});

const outputSchema = z.object({
  script: z.string(), // The complete script text
  metadata: z.object({
    totalDuration: z.number(),
    segmentTimings: z.array(
      z.object({
        segment: z.number(),
        startTime: z.number(),
        endTime: z.number(),
        title: z.string(),
      }),
    ),
    estimatedWordCount: z.number(),
  }),
});

// Schema for structured LLM output
const llmOutputSchema = z.object({
  dialogue: z.array(
    z.object({
      segment: z.number(),
      exchanges: z.array(
        z.object({
          speaker: z.string(),
          text: z.string(),
        }),
      ),
    }),
  ),
  segmentTimings: z.array(
    z.object({
      segment: z.number(),
      startTime: z.number(),
      endTime: z.number(),
      title: z.string(),
    }),
  ),
});

const description =
  "Generates a clean podcast script with just the spoken dialogue between hosts";

export const generatePodcastScript = createTool({
  id: "generatePodcastScript",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context, mastra }) => {
    if (!mastra?.llm) throw new Error("LLM not available");

    const { segments } = context;

    try {
      const llm = mastra.llm({
        provider: "ANTHROPIC",
        name: "claude-3-5-sonnet-20241022",
      });

      const result = await llm.generate(
        [
          {
            role: "system",
            content: `You are a podcast script writer creating natural dialogue between hosts.
            Output ONLY the actual words the hosts will speak - no stage directions, no descriptions, no non-verbal cues.
            Format each line starting with "Host 1:", "Host 2:", etc., followed by their exact spoken words.
            Create natural, conversational exchanges that cover the required points while maintaining flow.
            Ensure the dialogue sounds natural when spoken and avoids any written-style formality.`,
          },
          {
            role: "user",
            content: `
              Convert these segments into natural dialogue:
              ${segments
                .map(
                  (seg) => `
                Segment ${seg.segment}: ${seg.title}
                Duration: ${seg.duration} seconds
                Host Points:
                ${seg.hostPoints
                  .map(
                    (host) => `
                  ${host.hostRole}:
                  ${host.points
                    .map(
                      (point) => `
                    - ${point.type}: ${point.content}
                  `,
                    )
                    .join("\n")}
                `,
                  )
                  .join("\n")}
                
                Questions to Cover:
                ${seg.dynamicElements.questions.join("\n")}
              `,
                )
                .join("\n")}
            `,
          },
        ],
        {
          schema: llmOutputSchema,
        },
      );

      const { dialogue, segmentTimings }: z.infer<typeof llmOutputSchema> =
        result.object;

      // Convert dialogue array into clean script text
      const scriptText = dialogue
        .map((segment) =>
          segment.exchanges
            .map((exchange) => `${exchange.speaker}: ${exchange.text}`)
            .join("\n"),
        )
        .join("\n\n");

      // Calculate total duration and word count
      const totalDuration = segmentTimings.reduce(
        (acc, seg) => acc + (seg.endTime - seg.startTime),
        0,
      );
      const estimatedWordCount = scriptText.split(/\s+/).length;

      return {
        script: scriptText,
        metadata: {
          totalDuration,
          segmentTimings,
          estimatedWordCount,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate podcast script: ${error.message}`);
      }
      throw new Error(`Failed to generate podcast script: ${String(error)}`);
    }
  },
});
