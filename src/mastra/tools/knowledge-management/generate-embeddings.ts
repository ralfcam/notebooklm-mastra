import { createTool } from "@mastra/core";
import { embed, MDocument } from "@mastra/rag";
import { Document } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  chunkedContent: z.array(z.instanceof(Document)),
  keyTopics: z.array(z.string()),
  sourceId: z.string(),
  summary: z.string(),
});

const outputSchema = z.object({
  embeddedDocuments: z.array(
    z.object({
      document: z.instanceof(Document),
      embedding: z.array(z.number()),
    }),
  ),
  embeddedSummary: z.array(z.number()),
  sourceId: z.string(),
});

const description =
  "Generates embeddings for chunked documents, maintaining document context for the embedding pipeline";

export const generateEmbeddings = createTool({
  id: "generateEmbeddings",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { chunkedContent, sourceId, summary } = context;

    try {
      const contentEmbeddingRes = await embed(chunkedContent, {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 5,
      });

      const contentEmbeddings =
        "embeddings" in contentEmbeddingRes
          ? contentEmbeddingRes.embeddings
          : [contentEmbeddingRes.embedding];

      const embeddedDocuments = chunkedContent.map((document, index) => ({
        document,
        embedding: contentEmbeddings[index],
      }));

      const summaryEmbeddingRes = await embed(summary, {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 5,
      });

      const summaryEmbeddings =
        "embeddings" in summaryEmbeddingRes
          ? summaryEmbeddingRes.embeddings
          : [summaryEmbeddingRes.embedding];

      return {
        embeddedSummary: summaryEmbeddings[0],
        embeddedDocuments,
        sourceId,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embeddings: ${error.message}`);
      }
      throw new Error(`Failed to generate embeddings: ${String(error)}`);
    }
  },
});
