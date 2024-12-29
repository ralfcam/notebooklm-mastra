import { createSync } from "@mastra/core";
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

const outputSchema = z.void();

const description = "Saves a record of the source to the postgres engine";

export const saveSourceSync = createSync({
  id: "saveSourceSync",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const engine = mastra?.engine;

    if (!engine) throw new Error("Mastra engine not available.");

    const insertResults = await db
      .insert(sources)
      .values({
        name: c.source.name,
        summary: c.summary,
        summaryEmbedding: [],
        notebookId: c.notebookId,
      })
      .returning({ externalId: sources.id });

    await db.insert(sourceTopics).values(
      c.keyTopics.map((t) => ({
        topic: t,
        sourceId: insertResults[0].externalId,
      })),
    );

    let sourcesEntity = await engine.getEntity({ name: "sources" });

    if (!sourcesEntity) {
      sourcesEntity = await engine.createEntity({
        name: "sources",
        connectionId: c.notebookId,
      });
    }

    await engine.upsertRecords({
      entityId: sourcesEntity.id,
      records: [
        {
          data: { ...c.source, summary: c.summary, keyTopics: c.keyTopics },
          entityType: "sources",
          externalId: insertResults[0].externalId,
        },
      ],
    });
  },
});
