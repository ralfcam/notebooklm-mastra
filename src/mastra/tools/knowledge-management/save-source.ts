import { createTool } from "@mastra/core";
import { z } from "zod";
import { db } from "@/db";
import { sources, sourceTopics } from "@/db/schema/sources";

const inputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    name: z.string(),
    content: z.string(),
  }),
  keyTopics: z.array(z.string()),
  summary: z.string(),
});

const outputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
  }),
  keyTopics: z.array(z.string()),
  summary: z.string(),
});

const description = "Saves a record of the source to the postgres engine";

export const saveSource = createTool({
  id: "saveSource",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const engine = mastra?.engine;

    if (!engine) throw new Error("Mastra engine not available.");

    try {
      const insertResults = await db
        .insert(sources)
        .values({
          name: c.source.name,
          summary: c.summary,
          notebookId: c.notebookId,
        })
        .returning({ externalId: sources.id });

      await db.insert(sourceTopics).values(
        c.keyTopics.map((t) => ({
          topic: t,
          sourceId: insertResults[0].externalId,
        })),
      );

      return {
        notebookId: c.notebookId,
        source: {
          ...c.source,
          id: insertResults[0].externalId,
        },
        keyTopics: c.keyTopics,
        summary: c.summary,
      };
    } catch (error) {
      if (error instanceof Error)
        throw new Error(`Failed to save source: ${error.message}`);
      throw new Error(`Failed to save source`);
    }
  },
});
