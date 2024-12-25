import { createTool } from "@mastra/core";
import { MDocument } from "@mastra/rag";
import { z } from "zod";
import { Document } from "llamaindex";

const inputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
  }),
  keyTopics: z.array(z.string()),
  summary: z.string(),
});

const outputSchema = z.object({
  chunkedContent: z.array(z.instanceof(Document)),
  keyTopics: z.array(z.string()),
  sourceId: z.string(),
  summary: z.string(),
});

const description =
  "Splits input text into smaller, overlapping chunks of 512 tokens using a recursive strategy to maintain semantic coherence";

export const chunkText = createTool({
  id: "chunkText",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context: c }) => {
    const chunkedContent = await MDocument.fromText(c.source.content).chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });

    const chunkedSummary = await MDocument.fromText(c.summary).chunk({
      strategy: "recursive",
      size: 512,
    });

    return {
      chunkedContent,
      keyTopics: c.keyTopics,
      sourceId: c.source.id,
      summary: chunkedSummary,
    };
  },
});
