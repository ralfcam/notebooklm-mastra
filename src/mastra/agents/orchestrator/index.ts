import { Agent } from "@mastra/core";
import { orchestratorInstructions } from "./prompts";
import {
  submitForAudioProduction,
  generatePodcastOutline,
  querySourceSummaryAndChunks,
  savePodcastDetails,
  // updatePodcastStatus,
  validateSourcesAvailability,
  generatePodcastScript,
} from "./tools";

export const orchestrator = new Agent({
  name: "orchestrator",
  instructions: orchestratorInstructions,
  model: {
    provider: "ANTHROPIC",
    name: "claude-3-5-sonnet-20241022",
    toolChoice: "required",
  },
  tools: {
    validateSourcesAvailability,
    querySourceSummaryAndChunks,
    // updatePodcastStatus,
    savePodcastDetails,
    generatePodcastOutline,
    generatePodcastScript,
    submitForAudioProduction,
  },
});
