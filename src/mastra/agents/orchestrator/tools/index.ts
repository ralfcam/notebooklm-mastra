import { db } from "@/db";
import { sourceChunks, sources, sourceTopics } from "@/db/schema/sources";
import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { cosineDistance, count, desc, gt, inArray, sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { string, z } from "zod";

const validateSourcesAvailabilityInputSchema = z.object({
  notebookId: z.string(),
});

const validateSourcesAvailabilityOutputSchema = z.object({
  sourceSummaries: z.boolean(),
  summaryEmbeddings: z.boolean(),
  chunks: z.boolean(),
  chunkEmbeddings: z.boolean(),
  sourceTopics: z.boolean(),
});

export const validateSourcesAvailability = createTool({
  id: "validateSourcesAvailability",
  inputSchema: validateSourcesAvailabilityInputSchema,
  outputSchema: validateSourcesAvailabilityOutputSchema,
  execute: async ({ context }) => {
    const sourcesRes = await db
      .select({
        sourceSummaries: count(sources.summary),
        summaryEmbeddings: count(sources.summaryEmbedding),
        chunks: count(sourceChunks.content),
        chunkEmbeddings: count(sourceChunks.embedding),
        sourceTopics: count(sourceTopics.topic),
      })
      .from(sources)
      .leftJoin(sourceChunks, eq(sourceChunks.sourceId, sources.id))
      .leftJoin(sourceTopics, eq(sourceTopics.sourceId, sources.id))
      .where(eq(sources.notebookId, context.notebookId));

    return {
      sourceSummaries: sourcesRes[0].sourceSummaries !== 0,
      summaryEmbeddings: sourcesRes[0].summaryEmbeddings !== 0,
      chunks: sourcesRes[0].chunks !== 0,
      chunkEmbeddings: sourcesRes[0].chunkEmbeddings !== 0,
      sourceTopics: sourcesRes[0].sourceTopics !== 0,
    };
  },
});

const querySourceSummaryEmbeddingsInputSchema = z.object({
  notebookId: z.string(),
  query: string(),
  limit: z.number().default(5),
  threshold: z.number().default(0.5),
});

const querySourceSummaryEmbeddingsOutputSchema = z.object({
  results: z.array(
    z.object({
      sourceId: z.string().uuid(),
      sourceTitle: z.string(),
      sourceSummary: z.string(),
      sourceTopics: z.array(z.string()),
      similarity: z.number(),
    }),
  ),
});

export const querySourceSummaryEmbeddings = createTool({
  id: "querySourceSummaryEmbeddings",
  inputSchema: querySourceSummaryEmbeddingsInputSchema,
  outputSchema: querySourceSummaryEmbeddingsOutputSchema,
  execute: async ({ context: c }) => {
    try {
      const queryVector = await embed(c.query, {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 5,
      });

      if ("embedding" in queryVector) {
        const similarity = sql<number>`1 - (${cosineDistance(sources.summaryEmbedding, queryVector.embedding)})`;
        const keyTopics = sql<
          string[]
        >`array_agg(distinct source_topics.topic) filter (where source_topics.topic is not null)`;

        return {
          results: await db
            .select({
              sourceId: sources.id,
              sourceTitle: sources.name,
              sourceSummary: sources.summary,
              sourceTopics: keyTopics,
              similarity,
            })
            .from(sources)
            .leftJoin(sourceTopics, eq(sourceTopics.sourceId, sources.id))
            .groupBy(sources.id, sources.name, sources.summary)
            .where(
              and(
                eq(sources.notebookId, c.notebookId),
                gt(similarity, c.threshold),
              ),
            )
            .orderBy((t) => desc(t.similarity))
            .limit(c.limit),
        };
      } else {
        throw new Error("Expected queryVector to be single result");
      }
    } catch (error) {
      throw error;
    }
  },
});

export const querySourceChunksEmbeddings = createTool({
  id: "querySourceChunksEmbeddings",
  inputSchema: z.object({
    query: z.string(),
    sourceIds: z.array(z.string().uuid()),
    threshold: z.number().min(0).max(1),
    limit: z.number().min(1),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        chunkId: z.string().uuid(),
        content: z.string(),
        sourceId: z.string().uuid(),
        similarity: z.number(),
      }),
    ),
  }),
  execute: async ({ context: c }) => {
    try {
      const queryVector = await embed(c.query, {
        provider: "OPEN_AI",
        model: "text-embedding-ada-002",
        maxRetries: 5,
      });

      if ("embedding" in queryVector) {
        const similarity = sql<number>`1 - (${cosineDistance(sourceChunks.embedding, queryVector.embedding)})`;

        return {
          results: await db
            .select({
              chunkId: sourceChunks.id,
              content: sourceChunks.content,
              sourceId: sourceChunks.sourceId,
              similarity,
            })
            .from(sourceChunks)
            .where(
              and(
                inArray(sourceChunks.sourceId, c.sourceIds),
                gt(similarity, c.threshold),
              ),
            )
            .orderBy((t) => desc(t.similarity))
            .limit(c.limit),
        };
      } else {
        throw new Error("Expected queryVector to be single result");
      }
    } catch (error) {
      throw error;
    }
  },
});

export const generatePodcast = createTool({
  id: "generatePodcast",
  inputSchema: z.object({
    transcript: z.string(),
    voice1: z
      .string()
      .default(
        "s3://voice-cloning-zero-shot/29dd9a52-bd32-4a6e-bff1-bbb98dcc286a/original/manifest.json",
      ),
    voice2: z
      .string()
      .default(
        "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json",
      ),
    host1Prefix: z.string().default("Host 1:"),
    host2Prefix: z.string().default("Host 2:"),
    outputFormat: z.enum(["mp3", "wav"]).default("mp3"),
    pollIntervalMs: z.number().default(5000),
    maxRetries: z.number().default(60),
  }),
  outputSchema: z.object({
    audioUrl: z.string().url(),
    jobId: z.string(),
  }),
  execute: async ({ context: c, mastra }) => {
    const logger = mastra?.logger;

    if (!logger) throw new Error("Mastra logger not available");

    try {
      if (
        !process.env.PLAYDIALOG_USER_ID ||
        !process.env.PLAYDIALOG_SECRET_KEY
      ) {
        logger.error("PlayDialog credentials not configured.");
        throw new Error("PlayDialog credentials not configured");
      }

      const headers = {
        "X-USER-ID": process.env.PLAYDIALOG_USER_ID,
        Authorization: `Bearer ${process.env.PLAYDIALOG_SECRET_KEY}`,
        "Content-Type": "application/json",
      };

      logger.debug(
        JSON.stringify({
          model: "PlayDialog",
          text: c.transcript,
          voice: c.voice1,
          voice2: c.voice2,
          turnPrefix: c.host1Prefix,
          turnPrefix2: c.host2Prefix,
          outputFormat: c.outputFormat,
        }),
      );

      // Submit initial job
      const submitResponse = await fetch("https://api.play.ai/api/v1/tts/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "PlayDialog",
          text: c.transcript,
          voice: c.voice1,
          voice2: c.voice2,
          turnPrefix: c.host1Prefix,
          turnPrefix2: c.host2Prefix,
          outputFormat: c.outputFormat,
        }),
      });

      if (!submitResponse.ok) {
        logger.error(JSON.stringify(submitResponse, null, 2));
        throw new Error(`Failed to submit job: ${submitResponse.statusText}`);
      }

      const { id: jobId } = await submitResponse.json();
      const statusUrl = `https://api.play.ai/api/v1/tts/${jobId}`;

      // Poll for completion
      while (true) {
        const statusResponse = await fetch(statusUrl, { headers });

        if (!statusResponse.ok) {
          logger.error(JSON.stringify(statusResponse));
          throw new Error(
            `Failed to check status: ${statusResponse.statusText}`,
          );
        }

        const statusData = await statusResponse.json();
        const status = statusData.output?.status;

        if (status === "COMPLETED") {
          const audioUrl = statusData.output?.url;
          if (!audioUrl) {
            logger.error("Completed status but no audio URL provided");
            throw new Error("Completed status but no audio URL provided");
          }

          return {
            audioUrl,
            jobId,
          };
        }

        if (status === "FAILED") {
          logger.error(JSON.stringify(statusData, null, 2));
          throw new Error("Job processing failed");
        }

        await new Promise((resolve) => setTimeout(resolve, c.pollIntervalMs));
      }

      throw new Error("Max polling attempts reached");
    } catch (error) {
      throw error;
    }
  },
});
