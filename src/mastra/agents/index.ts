import { Agent } from "@mastra/core";
import { transcriptGeneratorInstructions } from "../prompts/transcript-generator";
import * as Tools from "@/mastra/tools";

export const transcriptGenerator = new Agent({
  name: "transcript-generator",
  instructions: transcriptGeneratorInstructions,
  model: {
    provider: "ANTHROPIC",
    name: "claude-3-5-sonnet-20241022",
    toolChoice: "auto",
  },
  tools: Tools,
});
