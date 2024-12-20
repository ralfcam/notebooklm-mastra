import { createTool } from "@mastra/core";
import { MDocument } from "@mastra/rag";
import { z } from "zod";

const inputSchema = z.object({
  content: z.string(),
});

const outputSchema = z.object({
  chunkedDocuments: z.array(z.instanceof(Document)),
});

const description =
  "Splits input text into smaller, overlapping chunks of 512 tokens using a recursive strategy to maintain semantic coherence";

export const chunkText = createTool({
  id: "chunkText",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context: { content } }) => {
    const chunkedDocuments = await MDocument.fromText(content).chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });

    return { chunkedDocuments };
  },
});
