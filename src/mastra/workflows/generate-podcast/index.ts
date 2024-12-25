import { Workflow } from "@mastra/core";
import { z } from "zod";
import { retrieveSourceMaterial } from "./steps";

export const generatePodcast = new Workflow({
  name: "generatePodcast",
  triggerSchema: z.object({
    notebookId: z.string(),
  }),
})
  .step(retrieveSourceMaterial, {
    variables: {
      notebookId: { step: "trigger", path: "notebookId" },
    },
  })
  .commit();
