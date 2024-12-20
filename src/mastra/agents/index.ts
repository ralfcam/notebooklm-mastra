import { Agent } from "@mastra/core";
import { podcastGeneratorInstructions } from "../prompts";

export const podcastGenerator = new Agent({
  name: "podcastGenerator",
  instructions: podcastGeneratorInstructions,
  model: {
    name: "anthropic-claude-3-5-sonnet-20241022-v2:0",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
});
