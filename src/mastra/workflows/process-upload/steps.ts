import { generateSourceSummaryPrompt } from "@/mastra/prompts/generate-source-summary";
import { Step } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
  notebookId: z.string(),
  source: z.object({
    name: z.string(),
    content: z.string(),
  }),
});

const outputSchema = z.object({
  source: z.object({ name: z.string(), content: z.string() }),
  summary: z.string(),
  keyTopics: z.array(z.string()),
  notebookId: z.string(),
});

export const generateSourceSummary = new Step({
  id: "generateSourceSummary",
  description:
    "Generate summary from a source. The summary includes an overview of what the source is about and a list of key topics from the source.",
  inputSchema,
  outputSchema,
  execute: async ({ context: c, mastra }) => {
    const knowledgeManager = mastra?.agents?.["knowledgeManager"];

    if (!knowledgeManager)
      throw new Error("knowledgeManager agent not available");

    const response = await knowledgeManager.generate(
      [
        { role: "system", content: generateSourceSummaryPrompt },
        { role: "user", content: c.source.content },
      ],
      { schema: outputSchema },
    );

    //NOTE: Object isn't inferred by typescript even though the schema is present
    return {
      summary: response.object.summary,
      keyTopics: response.object.keyTopics,
      source: c.source,
      notebookId: c.notebookId,
    };
  },
});
