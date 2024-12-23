import { Workflow } from "@mastra/core";
import { z } from "zod";
import { chunkText, generateEmbeddings, storeEmbeddings } from "../tools";

export const generatePodcast = new Workflow({
  name: "generatePodcast",
  triggerSchema: z.object({
    content: z.string(),
    title: z.string(),
  }),
})
  .step(chunkText, {
    variables: {
      content: { step: "trigger", path: "content" },
      title: { step: "trigger", path: "title" },
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
