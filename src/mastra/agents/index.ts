import { Agent } from "@mastra/core";
import {
  knowledgeManagerInstructions,
  podcastGeneratorInstructions,
} from "../prompts";

export const podcastGenerator = new Agent({
  name: "podcastGenerator",
  instructions: podcastGeneratorInstructions,
  model: {
    name: "anthropic-claude-3-5-sonnet-20241022-v2:0",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
  tools: {},
});

export const knowledgeManager = new Agent({
  name: "knowledgeManager",
  instructions: knowledgeManagerInstructions,
  model: {
    name: "anthropic-claude-3-5-sonnet-20241022-v2:0",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
  tools: {},
});
