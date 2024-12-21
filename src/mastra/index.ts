import { Mastra, createLogger } from "@mastra/core";
import { knowledgeManager, podcastGenerator } from "./agents";
import { generatePodcast } from "./workflows";

export const mastra = new Mastra({
  agents: { knowledgeManager, podcastGenerator },
  workflows: { generatePodcast },
  logger: createLogger({
    type: "CONSOLE",
    level: process.env.NODE_ENV === "development" ? "DEBUG" : "INFO",
  }),
});
