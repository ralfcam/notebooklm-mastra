import { Agent } from "@mastra/core";

export const researcher = new Agent({
  name: "researcher",
  instructions: "",
  model: {
    provider: "ANTHROPIC",
    name: "claude-3-5-sonnet-20241022",
    toolChoice: "auto",
  },
  tools: {},
});
