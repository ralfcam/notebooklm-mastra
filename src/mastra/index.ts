import { Mastra, createLogger } from "@mastra/core";

import { transcriptGenerator } from "./agents";
import { updateKnowledgeBase, generatePodcast } from "./workflows";

export const mastra = new Mastra({
  agents: { transcriptGenerator },
  workflows: {
    updateKnowledgeBase,
    generatePodcast,
  },
  logger: createLogger({
    type: "CONSOLE",
    level: process.env.NODE_ENV === "development" ? "DEBUG" : "INFO",
  }),
});
