import { Mastra, createLogger } from "@mastra/core";
import { knowledgeManager, podcastGenerator } from "./agents";

export const mastra = new Mastra({
  agents: { knowledgeManager, podcastGenerator },
  workflows: {},
  logger: createLogger({
    type: "CONSOLE",
    level: process.env.NODE_ENV === "development" ? "DEBUG" : "INFO",
  }),
});
