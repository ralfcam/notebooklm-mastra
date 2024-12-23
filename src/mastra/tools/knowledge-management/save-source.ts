import { createTool } from "@mastra/core";
import { z } from "zod";
import { db } from "@/db";
import { sources } from "@/db/schema/sources";

const inputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    name: z.string(),
    content: z.string(),
  }),
});

const outputSchema = z.void();

const description = "Saves a record of the source to the postgres engine";

export const saveSource = createTool({
  id: "saveSource",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const engine = mastra?.engine;

    if (!engine) throw new Error("Mastra engine not available.");

    const insertResults = await db
      .insert(sources)
      .values({
        content: c.source.content,
        type: "file",
        notebookId: c.notebookId,
      })
      .returning({ externalId: sources.id });

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
          data: { ...c.source },
          entityType: "sources",
          externalId: insertResults[0].externalId,
        },
      ],
    });
  },
});
