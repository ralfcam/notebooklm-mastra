import {
  configSchema as clientConfigSchema,
  PlayAIClient,
} from "@/lib/play-ai";
import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
  script: z.string(),
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
  voiceConfig: z.object({
    host1Voice: z.string(), // S3 URL for host 1's voice
    host2Voice: z.string(), // S3 URL for host 2's voice
    outputFormat: z.enum(["mp3", "wav"]).optional().default("mp3"),
  }),
});

const outputSchema = z.object({
  audioUrl: z.string(),
  audioMetadata: z.object({
    format: z.enum(["mp3", "wav"]),
    durationSeconds: z.number(),
    generationStatus: z.object({
      success: z.boolean(),
      errors: z.array(z.string()).optional(),
      warnings: z.array(z.string()).optional(),
    }),
  }),
});

const description = "Generates podcast audio from script using Play.ai API";

export const generatePodcastAudio = createTool({
  id: "generatePodcastAudio",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { script, voiceConfig, metadata } = context;

    try {
      const userId = process.env.PLAYDIALOG_USER_ID;
      const secretKey = process.env.PLAYDIALOG_SECRET_KEY;

      if (!userId || !secretKey) {
        throw new Error("Missing Play.ai API credentials");
      }

      const client = new PlayAIClient(
        clientConfigSchema.parse({
          userId,
          secretKey,
        }),
      );

      const audioUrl = await client.generateAndWaitForPodcast(
        {
          model: "PlayDialog",
          text: script,
          voice: voiceConfig.host1Voice,
          voice2: voiceConfig.host2Voice,
          turnPrefix: "Host 1:",
          turnPrefix2: "Host 2:",
          outputFormat: voiceConfig.outputFormat,
        },
        {
          maxAttempts: Math.max(30, Math.ceil(metadata.totalDuration / 30)), // At least 1 minute worth of attempts
          delayMs: 2000,
        },
      );

      const warnings: string[] = [];

      // Add warning if estimated duration seems off
      if (metadata.totalDuration < 30 || metadata.totalDuration > 3600) {
        warnings.push(
          `Unusual episode duration: ${metadata.totalDuration} seconds`,
        );
      }

      // Add warning if word count seems extreme
      const averageWordsPerMinute =
        metadata.estimatedWordCount / (metadata.totalDuration / 60);
      if (averageWordsPerMinute > 180 || averageWordsPerMinute < 100) {
        warnings.push(
          `Unusual speaking pace: ${Math.round(averageWordsPerMinute)} words per minute`,
        );
      }

      return {
        audioUrl,
        audioMetadata: {
          format: voiceConfig.outputFormat,
          durationSeconds: metadata.totalDuration,
          generationStatus: {
            success: true,
            warnings: warnings.length > 0 ? warnings : undefined,
          },
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {
          audioUrl: "",
          audioMetadata: {
            format: voiceConfig.outputFormat,
            durationSeconds: metadata.totalDuration,
            generationStatus: {
              success: false,
              errors: [error.message],
            },
          },
        };
      }
      throw new Error(`Failed to generate podcast audio: ${String(error)}`);
    }
  },
});
