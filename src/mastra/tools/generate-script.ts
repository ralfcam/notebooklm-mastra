import { createTool } from "@mastra/core";
import { z } from "zod";
import { Document } from "llamaindex";

export const generateScript = createTool({
  id: "generate-script",
  description: "Generate a podcast script using retrieved context",
  inputSchema: z.object({
    topic: z.string(),
    contextDocs: z.array(z.instanceof(Document)),
    duration: z.number().min(1).max(60).optional(), // Duration in minutes
  }),
  outputSchema: z.object({
    transcript: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const transcriptGenerator = mastra?.agents?.["transcriptGenerator"];

    if (!transcriptGenerator) {
      throw new Error("Transcript generator agent not available");
    }

    // Prepare context from documents
    const contextText = context.contextDocs.map((doc) => doc.text).join("\n\n");

    // Generate the script using the transcript generator agent
    const response = await transcriptGenerator.generate([
      {
        role: "user",
        content: `Generate a podcast script about "${context.topic}". Target duration: ${context.duration || 5} minutes.

Context information to use:
${contextText}

Remember to format the script with "Alex:" and "Sarah:" speaker prefixes.`,
      },
    ]);

    return {
      transcript: response.text,
    };
  },
});
