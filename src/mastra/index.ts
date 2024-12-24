import { Mastra, createLogger } from "@mastra/core";
import { PostgresEngine } from "@mastra/engine";
import { knowledgeManager, podcastGenerator } from "./agents";
import { generatePodcast, processUpload } from "./workflows";

//BUG: "Property #private missing in type PostgresEngine but required in MastraEngine"
const engine = new PostgresEngine({
  url: process.env.DB_URL!,
});

const logger = createLogger({
  type: "CONSOLE",
  level: process.env.NODE_ENV === "development" ? "DEBUG" : "INFO",
});

export const mastra = new Mastra({
  agents: { knowledgeManager, podcastGenerator },
  workflows: { generatePodcast, processUpload },
  logger,
  //@ts-expect-error check PostgresEngine note
  engine,
});
