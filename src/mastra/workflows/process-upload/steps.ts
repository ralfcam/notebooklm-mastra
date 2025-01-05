import { db } from "@/db";
import { notebooks } from "@/db/schema/notebooks";
import { sources } from "@/db/schema/sources";
import { generateNotebookSummariesPrompt } from "@/mastra/prompts/generate-notebook-summaries";
import { generateSourceSummaryPrompt } from "@/mastra/prompts/generate-source-summary";
import { Step } from "@mastra/core";
import { eq } from "drizzle-orm";
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

const notebookSummaryOutputSchema = z.object({
  emoji: z
    .string()
    .describe("an emoji that captures the essence of the topic and summary"),
  title: z
    .string()
    .describe("The title that would be fitting for this notebook"),
  summary: z.string(),
});

export const generateNotebookSummary = new Step({
  id: "generateNotebookSummary",
  description:
    "Generate the summary of the whole notebook project from the available sources, their summaries and key topics",
  outputSchema: notebookSummaryOutputSchema,
  execute: async ({ context, mastra }) => {
    const stepResults =
      context.machineContext?.stepResults.generateSourceSummary;
    let notebookId: string;
    if (stepResults?.status === "success") {
      notebookId = stepResults.payload.notebookId;
    } else {
      throw new Error(
        "Could not retrieve the notebookId from generateSourceSummary step",
      );
    }
    const knowledgeManager = mastra?.agents?.["knowledgeManager"];

    if (!knowledgeManager)
      throw new Error("knowledgeManager agent not available.");

    const sourcesSummaries = await db
      .select({
        name: sources.name,
        summary: sources.summary,
      })
      .from(sources)
      .where(eq(sources.notebookId, notebookId));

    const response = await knowledgeManager.generate(
      [
        { role: "system", content: generateNotebookSummariesPrompt },
        {
          role: "user",
          content: `
Here are all the names of the sources and their summaries.
${sourcesSummaries.map((s) => s.name + "->" + s.summary + "\n\n\n")}
`,
        },
      ],
      { schema: notebookSummaryOutputSchema },
    );

    const { object: o } = response;

    await db
      .update(notebooks)
      .set({
        emoji: o.emoji,
        title: o.title,
        summary: o.summary,
      })
      .where(eq(notebooks.id, notebookId))
      .returning();

    return response.object;
  },
});
