import { Agent } from "@mastra/core";
import { orchestratorInstructions } from "./prompts";
import {
  generatePodcast,
  querySourceChunksEmbeddings,
  querySourceSummaryEmbeddings,
  validateSourcesAvailability,
} from "./tools";

export const orchestrator = new Agent({
  name: "orchestrator",
  instructions: orchestratorInstructions,
  model: {
    provider: "ANTHROPIC",
    name: "claude-3-5-sonnet-20241022",
    toolChoice: "auto",
  },
  tools: {
    validateSourcesAvailability,
    querySourceSummaryEmbeddings,
    querySourceChunksEmbeddings,
    generatePodcast,
  },
});
