import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import { generateSourceSummaryPrompt } from "../prompts/generate-source-summary";
import { db } from "@/db";
import { sourceChunks, sources, sourceTopics } from "@/db/schema/sources";
import { eq } from "drizzle-orm";
import { embed, MDocument } from "@mastra/rag";
import { EmbedManyResult } from "ai";

export const summarizeSource = new Workflow({
  name: "summarizeSource",
  triggerSchema: z.object({
    markdown: z.string(),
    sourceId: z.string(),
  }),
})
  .step(
    new Step({
      id: "generateSourceSummary",
      description: "Generate a summary of the source",
      inputSchema: z.object({
        markdown: z.string(),
        sourceId: z.string(),
      }),
      execute: async ({ context: c, mastra: m }) => {
        const logger = m?.logger;
        const agent = m?.agents?.["orchestrator"];

        if (!agent) throw new Error("agent not availbale");
        if (!logger) throw new Error("logger not available");

        const response = await agent.generate(
          [
            { role: "system", content: generateSourceSummaryPrompt },
            { role: "user", content: c.markdown },
          ],
          {
            schema: z.object({
              summary: z.string(),
              keyTopics: z.array(z.string()),
            }),
          },
        );

        const { summary, keyTopics } = response.object as {
          summary: string;
          keyTopics: string[];
        };

        db.insert(sourceTopics)
          .values(keyTopics.map((t) => ({ topic: t, sourceId: c.sourceId })))
          .execute();

        const docs = await MDocument.fromText(c.markdown).chunk({
          strategy: "markdown",
          size: 512,
          overlap: 50,
        });

        const embeddings = (await embed(docs, {
          provider: "OPEN_AI",
          model: "text-embedding-ada-002",
          maxRetries: 5,
        })) as EmbedManyResult<string>;

        const chunkInserts = embeddings.values.reduce(
          (pv, cv, idx) => {
            return [
              ...pv,
              {
                content: cv,
                embedding: embeddings.embeddings[idx],
                sourceId: c.sourceId,
                createdAt: new Date(),
              },
            ];
          },
          [] as {
            content: string;
            sourceId: string;
            embedding: number[];
            createdAt: Date;
          }[],
        );

        db.update(sources)
          .set({ summary, processingStatus: "summarized" })
          .where(eq(sources.id, c.sourceId))
          .execute();

        db.insert(sourceChunks).values(chunkInserts).execute();

        return {
          summary,
          keyTopics,
          sourceId: c.sourceId,
        };
      },
    }),
    {
      variables: {
        markdown: { step: "trigger", path: "markdown" },
        sourceId: { step: "trigger", path: "sourceId" },
      },
    },
  )
  .commit();
