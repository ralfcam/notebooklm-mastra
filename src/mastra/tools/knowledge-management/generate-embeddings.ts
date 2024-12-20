import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { Document } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  chunkedDocuments: z.array(z.instanceof(Document)),
});

const outputSchema = z.object({
  embeddedDocuments: z.array(
    z.object({
      document: z.instanceof(Document),
      embedding: z.array(z.number()),
    }),
  ),
});

const description =
  "Generates embeddings for chunked documents, maintaining document context for the embedding pipeline";

export const generateEmbeddings = createTool({
  id: "generateEmbeddings",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { chunkedDocuments } = context;

    try {
      const result = await embed(chunkedDocuments, {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 5,
      });

      const embeddings =
        "embeddings" in result ? result.embeddings : [result.embedding];

      const embeddedDocuments = chunkedDocuments.map((document, index) => ({
        document,
        embedding: embeddings[index],
      }));

      return { embeddedDocuments };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embeddings: ${error.message}`);
      }
      throw new Error(`Failed to generate embeddings: ${String(error)}`);
    }
  },
});
