import { createTool } from "@mastra/core";
import { MDocument } from "@mastra/rag";
import { Document } from "llamaindex";
import { z } from "zod";
import { chunkInputSchema } from "./schemas";

export const chunkInput = createTool({
  id: "chunk-input",
  inputSchema: chunkInputSchema,
  outputSchema: z.object({
    chunkedDocuments: z.array(z.instanceof(Document)),
  }),
  description:
    "Process text or markdown input content returning chunked documents ready for embedding.",
  execute: async ({ context }) => {
    let mDoc: MDocument;

    switch (context.contentType) {
      case "text":
        mDoc = MDocument.fromText(context.content);
        break;
      case "markdown":
        mDoc = MDocument.fromMarkdown(context.content);
      default:
        throw new Error("Failed to chunk content. Unsupported content type.");
    }

    const chunkedDocuments: Document[] = await mDoc.chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });

    return { chunkedDocuments };
  },
});
