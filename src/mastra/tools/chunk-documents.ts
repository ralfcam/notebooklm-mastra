import { createTool } from "@mastra/core";
import { MDocument } from "@mastra/rag";

import { z } from "zod";

export const chunkDocuments = createTool({
  id: "chunk-documents",
  inputSchema: z.object({
    content: z.string(),
    fileType: z.enum(["text", "markdown"]),
  }),
  description:
    "Process various document types and prepares them for embedding.",
  execute: async ({ context }) => {
    let mDoc: MDocument;

    switch (context.fileType) {
      case "text":
        mDoc = MDocument.fromText(context.content);
        break;
      case "markdown":
        mDoc = MDocument.fromMarkdown(context.content);
      default:
        throw new Error("Failed to chunk document. Unsorpotted file type.");
    }

    // TODO: Need to infer/get type of chunks
    const chunks = await mDoc.chunk({
      strategy: "recursive",
      size: 512,
      overlap: 50,
    });

    return { chunks };
  },
});
