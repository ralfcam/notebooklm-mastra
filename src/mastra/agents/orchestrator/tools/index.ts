import { db } from "@/db";
import {
  podcastStatus,
  notebooks,
  notebookPodcast,
} from "@/db/schema/notebooks";
import { createTool } from "@mastra/core";
import { embed } from "@mastra/rag";
import { cosineDistance, eq } from "drizzle-orm";
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
    const res = await db.query.sources.findMany({
      where: (t, h) => h.eq(t.id, context.notebookId),
      columns: {
        name: true,
      },
      with: {
        sourceSummaries: {
          columns: {
            summary: true,
            embedding: true,
          },
        },
        sourceChunks: {
          columns: {
            content: true,
            embedding: true,
          },
        },
        sourceTopics: {
          columns: {
            topic: true,
          },
        },
      },
    });

    return {
      sourceSummaries: res.every((s) =>
        s.sourceSummaries.every((ss) => !!ss.summary),
      ),
      summaryEmbeddings: res.every((s) =>
        s.sourceSummaries.every((ss) => !!ss.embedding?.length),
      ),
      chunks: res.every((s) => s.sourceChunks.every((sc) => !!sc.content)),
      chunkEmbeddings: res.every((s) =>
        s.sourceChunks.every((sc) => !!sc.embedding?.length),
      ),
      sourceTopics: res.every((s) => s.sourceTopics.every((st) => st.topic)),
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
      id: z.string(),
      name: z.string(),
      sourceSummaries: z.array(z.object({ summary: z.string().nullable() })),
      sourceChunks: z.array(z.object({ content: z.string().nullable() })),
      sourceTopics: z.array(z.object({ topic: z.string().nullable() })),
    }),
  ),
});

export const querySourceSummaryAndChunks = createTool({
  id: "querySourceSummaryAndChunks",
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
        return {
          results: await db.query.sources.findMany({
            where: (t, h) => h.eq(t.notebookId, c.notebookId),
            columns: {
              id: true,
              name: true,
            },
            with: {
              sourceSummaries: {
                columns: {
                  summary: true,
                },
                where: (t, h) =>
                  h.gte(
                    h.sql<number>`1 - (${cosineDistance(t.embedding, queryVector.embedding)})`,
                    c.threshold,
                  ),
              },
              sourceChunks: {
                columns: {
                  content: true,
                },
                where: (t, h) =>
                  h.gte(
                    h.sql<number>`1 - (${cosineDistance(t.embedding, queryVector.embedding)})`,
                    c.threshold,
                  ),
              },
              sourceTopics: {
                columns: {
                  topic: true,
                },
              },
            },
            limit: c.limit,
          }),
        };
      } else {
        throw new Error("Expected queryVector to be single result");
      }
    } catch (error) {
      throw error;
    }
  },
});

export const submitForAudioProduction = createTool({
  id: "submitForAudioProduction",
  description: "Submit the show transcript for audio production",
  inputSchema: z.object({
    transcript: z.string().describe("pass the script as is to this tool"),
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
    pollUrl: z
      .string()
      .url()
      .describe("The url to query to get the status of the job"),
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
      const pollUrl = `https://api.play.ai/api/v1/tts/${jobId}`;

      return {
        pollUrl,
      };
    } catch (error) {
      throw error;
    }
  },
});

export const updatePodcastStatus = createTool({
  id: "updatePodcastStatus",
  description: "Update the stage of the podcast generation process",
  inputSchema: z.object({
    notebookId: z.string().uuid(),
    podcastStatus: z.enum(podcastStatus.enumValues),
  }),
  execute: async ({ context: c }) => {
    return await db
      .update(notebooks)
      .set({ podcastStatus: c.podcastStatus })
      .where(eq(notebooks.id, c.notebookId))
      .returning({ updatedStatus: notebooks.podcastStatus });
  },
});

export const savePodcastDetails = createTool({
  id: "savePodcastDetails",
  description: "save podcast details to the database",
  inputSchema: z.object({
    notebookId: z.string().uuid(),
    podcastScript: z.string().optional(),
    audioUrl: z.string().url().optional(),
  }),
  execute: async ({ context: c }) => {
    return await db
      .insert(notebookPodcast)
      .values({
        notebookId: c.notebookId,
        podcastScript: c.podcastScript,
        audioUrl: c.audioUrl,
      })
      .returning({
        notebookId: notebookPodcast.notebookId,
        podcastScript: notebookPodcast.podcastScript,
        audioUrl: notebookPodcast.audioUrl,
      });
  },
});

export const generatePodcastOutline = createTool({
  id: "generatePodcastOutline",
  description: "Generate a show outline for the podcast.",
  inputSchema: z.object({
    instructions: z
      .string()
      .describe(
        "Key instructions to have in mind while generating a the show outline",
      ),
    keyInsights: z
      .array(z.string())
      .describe(
        "A list of key insights to make sure to highlight and give air time in the podcast",
      ),
  }),
  outputSchema: z.object({
    outline: z.object({
      title: z.string(),
      segments: z.array(
        z.object({
          title: z.string(),
          points: z.array(z.string()),
        }),
      ),
    }),
  }),
  execute: async ({ context: c, mastra: m }) => {
    const agent = m?.agents?.["orchestrator"];

    if (!agent) throw new Error("agent not available");

    const res = await agent.llm.generate(
      [
        {
          role: "system",
          content: `Here are the instructions. \n${c.instructions}\n The following are the key insights. ${c.keyInsights.join("\n")}`,
        },
        {
          role: "user",
          content:
            "Given the instructions and key insights, generate a show outline for a podcast that will ensure all the relevant and important information is highlighted. Use the response from this tool in the next step",
        },
      ],
      {
        schema: z.object({
          outline: z.object({
            title: z.string(),
            segments: z.array(
              z.object({
                title: z.string(),
                points: z.array(z.string()),
              }),
            ),
          }),
        }),
      },
    );

    return res.object;
  },
});

export const generatePodcastScript = createTool({
  id: "generatePodcastScript",
  description: "Generate a podcast script based on the given outline",
  inputSchema: z.object({
    outline: z.object({
      title: z.string(),
      segments: z.array(
        z.object({
          title: z.string(),
          points: z.array(z.string()),
        }),
      ),
    }),
  }),
  outputSchema: z.object({
    script: z.string().describe("The script of the show"),
  }),
  execute: async ({ context: c, mastra: m }) => {
    const agent = m?.agents?.["orchestrator"];

    if (!agent) throw new Error("agent not available");

    const res = await agent.llm.generate(
      [
        {
          role: "user",
          content: `Here is the show outline: ${JSON.stringify(c.outline, null, 2)}.\nUse it to generate a podcast script that strictly adheres to the described format. Do not include non-verbal cues and directions. Return only a script prefixed with either Host 1: or Host 2:. Do not indicate what segement it belongs to. Just the transcript`,
        },
      ],
      {
        schema: z.object({
          script: z
            .string()
            .describe(
              "Just the transcript prefixed with either Host 1: or Host 2:",
            ),
        }),
      },
    );

    return res.object;
  },
});
