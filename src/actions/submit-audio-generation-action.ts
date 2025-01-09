"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";

export const submitAudioGenerationAction = actionClient
  .metadata({ name: "submitAudioGenerationAction" })
  .schema(z.object({ script: z.string() }))
  .action(async ({ parsedInput }) => {
    const headers = {
      "X-USER-ID": process.env.PLAYDIALOG_USER_ID!,
      Authorization: `Bearer ${process.env.PLAYDIALOG_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await fetch("https://api.play.ai/api/v1/tts/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "PlayDialog",
        text: parsedInput.script,
        voice:
          "s3://voice-cloning-zero-shot/29dd9a52-bd32-4a6e-bff1-bbb98dcc286a/original/manifest.json",
        voice2:
          "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json",
        turnPrefix: "Host 1:",
        turnPrefix2: "Host 2:",
        outputFormat: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    const { id: jobId } = await response.json();
    const pollUrl = `https://api.play.ai/api/v1/tts/${jobId}`;

    return {
      pollUrl,
    };
  });
