import { Mastra, createLogger } from "@mastra/core";

import { transcriptGenerator } from "./agents";
import { updateKnowledgeBase } from "./workflows";

export const mastra = new Mastra({
  agents: { transcriptGenerator },
  workflows: { updateKnowledgeBase },
  logger: createLogger({
    type: "CONSOLE",
    level: "DEBUG",
  }),
});
