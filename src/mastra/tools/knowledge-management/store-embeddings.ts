import { db } from "@/db";
import { sourceChunks, sources } from "@/db/schema/sources";
import { createTool } from "@mastra/core";
import { eq } from "drizzle-orm";
import { Document } from "llamaindex";
import { z } from "zod";

const inputSchema = z.object({
  embeddedDocuments: z.array(
    z.object({
      document: z.instanceof(Document),
      embedding: z.array(z.number()),
    }),
  ),
  embeddedSummary: z.array(z.number()),
  sourceId: z.string(),
});

const outputSchema = z.void();

const description = "Stores document embeddings using PgVector with metadata";

export const storeEmbeddings = createTool({
  id: "storeEmbeddings",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { embeddedDocuments, embeddedSummary, sourceId } = context;

    const stepResults =
      context.machineContext?.stepResults.generateSourceSummary;
    let notebookId: string;
    if (stepResults?.status === "success") {
      notebookId = stepResults.payload.notebookId;
    } else {
      throw new Error(
        "Could not retrieve the notebookId from generateSourceSummary step",
      );
    }

    const chunkInserts = embeddedDocuments.map((doc) => ({
      content: doc.document.text,
      embedding: doc.embedding,
      sourceId,
    }));

    try {
      await db
        .update(sources)
        .set({ summaryEmbedding: embeddedSummary })
        .where(eq(sources.notebookId, notebookId));

      await db.insert(sourceChunks).values(chunkInserts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to store embeddings: ${error.message}`);
      }
      throw new Error(`Failed to store embeddings: ${String(error)}`);
    }
  },
});
