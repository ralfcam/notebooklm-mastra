import {
  parseAndChunkFile,
  saveSource,
  chunkText,
  generateEmbeddings,
  storeEmbeddings,
} from "@/mastra/tools";
import { Workflow } from "@mastra/core";
import { generateSourceSummary } from "./steps";
import { z } from "zod";

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
