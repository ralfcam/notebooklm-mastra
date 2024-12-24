import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import {
  chunkText,
  generateEmbeddings,
  parseAndChunkFile,
  saveSource,
  storeEmbeddings,
} from "../tools";
import { generateSourceSummaryPrompt } from "../prompts/generate-source-summary";

const inputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    name: z.string(),
    content: z.string(),
  }),
});

const outputSchema = z.object({
  source: z.object({ name: z.string(), content: z.string() }),
  summary: z.string(),
  keyTopics: z.array(z.string()),
  notebookId: z.string(),
});

const generateSourceSummary = new Step({
  id: "generateSourceSummary",
  description:
    "Generate summary from a source. The summary includes an overview of what the source is about and a list of key topics from the source.",
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const knowledgeManager = mastra?.agents?.["knowledgeManager"];

    if (!knowledgeManager)
      throw new Error("knowledgeManager agent not available");

    const response = await knowledgeManager.generate(
      [
        { role: "system", content: generateSourceSummaryPrompt },
        { role: "user", content: c.source.content },
      ],
      { schema: outputSchema },
    );

    //NOTE: Object isn't inferred by typescript even though the schema is present
    return {
      summary: response.object.summary,
      keyTopics: response.object.keyTopics,
      source: c.source,
      notebookId: c.notebookId,
    };
  },
});

export const processUpload = new Workflow({
  name: "processUpload",
  triggerSchema: z.object({
    buffer: z.instanceof(ArrayBuffer),
    fileName: z.string(),
    notebookId: z.string(),
  }),
})
  .step(parseAndChunkFile, {
    variables: {
      buffer: { step: "trigger", path: "buffer" },
      fileName: { step: "trigger", path: "fileName" },
      notebookId: { step: "trigger", path: "notebookId" },
    },
  })
  .then(generateSourceSummary, {
    variables: {
      source: { step: parseAndChunkFile, path: "source" },
      notebookId: { step: parseAndChunkFile, path: "notebookId" },
    },
  })
  .then(saveSource, {
    variables: {
      keyTopics: { step: generateSourceSummary, path: "keyTopics" },
      notebookId: { step: generateSourceSummary, path: "notebookId" },
      source: { step: generateSourceSummary, path: "source" },
      summary: { step: generateSourceSummary, path: "summary" },
    },
  })
  .then(chunkText, {
    variables: {
      title: { step: saveSource, path: "title" },
      content: { step: saveSource, path: "content" },
    },
  })
  .then(generateEmbeddings, {
    variables: {
      chunkedDocuments: { step: chunkText, path: "chunkedDocuments" },
      metadata: { step: chunkText, path: "metadata" },
    },
  })
  .then(storeEmbeddings, {
    variables: {
      embeddedDocuments: {
        step: generateEmbeddings,
        path: "embeddedDocuments",
      },
      metadata: {
        step: generateEmbeddings,
        path: "metadata",
      },
    },
  })
  .commit();
