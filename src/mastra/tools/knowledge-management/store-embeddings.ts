import { createTool } from "@mastra/core";
import { PgVector } from "@mastra/rag";
import { Document } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  embeddedDocuments: z.array(
    z.object({
      document: z.instanceof(Document),
      embedding: z.array(z.number()),
    }),
  ),
  metadata: z.object({
    title: z.string(),
  }),
  indexName: z.string(),
});

const outputSchema = z.object({
  success: z.boolean(),
  vectorIds: z.array(z.string()),
});

const description = "Stores document embeddings using PgVector with metadata";

export const storeEmbeddings = createTool({
  id: "storeEmbeddings",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { embeddedDocuments, metadata, indexName } = context;
    const pgVector = new PgVector(process.env.DB_URL!);

    try {
      // Ensure index exists (creates if not)
      const dimension = embeddedDocuments[0].embedding.length;
      await pgVector.createIndex(indexName, dimension);

      // Prepare data for upsert
      const vectors = embeddedDocuments.map((doc) => doc.embedding);
      const documentMetadata = embeddedDocuments.map((doc) => ({
        ...doc.document.metadata,
        text: doc.document.text,
        title: metadata.title,
      }));

      // Store vectors and metadata
      const vectorIds = await pgVector.upsert(
        indexName,
        vectors,
        documentMetadata,
      );

      await pgVector.disconnect();

      return {
        success: true,
        vectorIds,
      };
    } catch (error: unknown) {
      await pgVector.disconnect();

      if (error instanceof Error) {
        throw new Error(`Failed to store embeddings: ${error.message}`);
      }
      throw new Error(`Failed to store embeddings: ${String(error)}`);
    }
  },
});
