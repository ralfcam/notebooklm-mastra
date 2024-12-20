import { createTool } from "@mastra/core";
import { z } from "zod";

const PLAY_AI_API_BASE = "https://api.play.ai/api/v1";
const DEFAULT_VOICE_1 =
  "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json";
const DEFAULT_VOICE_2 =
  "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json";

async function waitForCompletion(
  jobId: string,
  headers: Record<string, string>,
): Promise<string> {
  const url = `${PLAY_AI_API_BASE}/tts/${jobId}`;
  const delaySeconds = 2;

  while (true) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to check job status: ${response.statusText}`);
    }

    const data = await response.json();
    const status = data.output?.status;

    if (status === "COMPLETED") {
      return data.output.url;
    } else if (status === "FAILED") {
      throw new Error(
        `Audio generation failed: ${data.output?.error || "Unknown error"}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }
}

export const generatePodcastAudio = createTool({
  id: "generate-podcast-audio",
  description: "Generate podcast audio using Play.ai API",
  inputSchema: z.object({
    script: z.string(),
    format: z.object({
      host1Name: z.string(),
      host2Name: z.string(),
    }),
    voices: z
      .object({
        host1Voice: z.string().default(DEFAULT_VOICE_1),
        host2Voice: z.string().default(DEFAULT_VOICE_2),
      })
      .default({
        host1Voice: DEFAULT_VOICE_1,
        host2Voice: DEFAULT_VOICE_2,
      }),
  }),
  execute: async ({ context }) => {
    const { script, format, voices } = context;

    const headers = {
      "X-USER-ID": process.env.PLAYDIALOG_USER_ID!,
      Authorization: process.env.PLAYDIALOG_SECRET_KEY!,
      "Content-Type": "application/json",
    };

    // Format script to match Play.ai requirements
    const formattedScript = script
      .replace(new RegExp(`${format.host1Name}:`, "g"), "Host 1:")
      .replace(new RegExp(`${format.host2Name}:`, "g"), "Host 2:");

    const payload = {
      model: "PlayDialog",
      text: formattedScript,
      voice: voices.host1Voice,
      voice2: voices.host2Voice,
      turnPrefix: "Host 1:",
      turnPrefix2: "Host 2:",
      outputFormat: "mp3",
    };

    try {
      // Initialize audio generation
      const response = await fetch(`${PLAY_AI_API_BASE}/tts/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to initialize audio generation: ${response.statusText}`,
        );
      }

      const { id: jobId } = await response.json();

      // Wait for completion and get audio URL
      const audioUrl = await waitForCompletion(jobId, headers);

      return {
        audioUrl,
        jobId,
      };
    } catch (error) {
      console.error("Error generating podcast audio:", error);
      throw error;
    }
  },
});
