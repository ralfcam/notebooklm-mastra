import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import {
  chunkInputSchema,
  parseAndChunkFileInputSchema,
} from "../tools/schemas";
import { generateEmbeddings, storeEmbeddings } from "../tools";

// Create a source first
const createSource = new Step({
  id: "create-source",
  description: "Create a new source in the database",
  execute: async (c) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const triggerData = c.context.machineContext?.triggerData;

    // add source

    return {};
  },
});

const chunk = new Step({
  id: "chunk",
  description: "Chunk input",
  execute: async (c) => {
    const triggerData = c.context.machineContext?.triggerData;
    const tools = c.mastra?.agents?.["notebook-llm-mastra"]?.tools;

    if (!tools) throw new Error("Can't access mastra tools for some reason.");

    if ("file" in triggerData) {
      const executeParseAndChunk = tools["parse-and-chunk-file"]?.execute;

      return {
        ...(await executeParseAndChunk({
          machineContext: c.context.machineContext,
          ...triggerData,
        })),
        sourceId: triggerData.sourceId,
      };
    }

    if ("content" in triggerData && "contentType" in triggerData) {
      const executeChunkInput = tools?.["chunk-input"]?.execute;

      return {
        ...(await executeChunkInput({
          machineContext: c.context.machineContext,
          ...triggerData,
        })),
        sourceId: triggerData.sourceId,
      };
    }

    return new Promise((_r, rej) => {
      rej({
        error:
          "Couldn't determine appropriate chunking strategy for the content provided to take.",
      });
    });
  },
});

// Update the input schema to include source information
const sourceInfoSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
});

export const updateKnowledgeBase = new Workflow({
  name: "updateKnowledgeBase",
  triggerSchema: z.union([
    chunkInputSchema.merge(sourceInfoSchema),
    parseAndChunkFileInputSchema.merge(sourceInfoSchema),
  ]),
})
  .step(createSource)
  .then(chunk)
  .then(generateEmbeddings)
  .then(storeEmbeddings)
  .commit();
