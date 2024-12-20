import { createTool } from "@mastra/core";
import { z } from "zod";

const PLAY_API_URL = "https://api.play.ai/api/v1/tts/";

// Default voices for Alex and Sarah
const DEFAULT_VOICES = {
  alex: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json",
  sarah:
    "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json",
};

export const generatePodcastAudio = createTool({
  id: "generate-podcast-audio",
  description:
    "Generate podcast audio from a transcript using Play AI's text-to-speech API",
  inputSchema: z.object({
    transcript: z.string(),
    voice1: z.string().optional(),
    voice2: z.string().optional(),
    outputFormat: z.enum(["mp3", "wav"]).optional(),
  }),
  outputSchema: z.object({
    audioUrl: z.string(),
  }),
  execute: async ({ context }) => {
    const headers = {
      "X-USER-ID": process.env.PLAYDIALOG_USER_ID!,
      Authorization: process.env.PLAYDIALOG_SECRET_KEY!,
      "Content-Type": "application/json",
    };

    // Prepare payload
    const payload = {
      model: "PlayDialog",
      text: context.transcript,
      voice: context.voice1 || DEFAULT_VOICES.alex,
      voice2: context.voice2 || DEFAULT_VOICES.sarah,
      turnPrefix: "Alex:",
      turnPrefix2: "Sarah:",
      outputFormat: context.outputFormat || "mp3",
    };

    // Initial request to start generation
    const response = await fetch(PLAY_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to start audio generation: ${response.statusText}`,
      );
    }

    const { id: jobId } = await response.json();

    // Poll for completion
    const checkUrl = `${PLAY_API_URL}${jobId}`;
    let audioUrl: string | null = null;

    while (!audioUrl) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      const statusResponse = await fetch(checkUrl, { headers });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      const status = statusData.output?.status;

      if (status === "COMPLETED") {
        audioUrl = statusData.output?.url;
      } else if (status === "FAILED") {
        throw new Error("Audio generation failed");
      }
    }

    return { audioUrl };
  },
});
