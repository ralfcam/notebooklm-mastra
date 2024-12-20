import { createTool } from "@mastra/core";
import { z } from "zod";

const inputSchema = z.object({
  sources: z.array(
    z.object({
      source: z.string(),
      relevance: z.number(),
      contentSnippets: z.array(
        z.object({
          text: z.string(),
          relevance: z.number(),
        }),
      ),
    }),
  ),
  style: z
    .enum(["narrative", "analytical", "conversational"])
    .optional()
    .default("narrative"),
  maxLength: z.number().optional().default(2000),
});

const outputSchema = z.object({
  synthesis: z.string(),
  topicFlow: z.array(z.string()),
  contextMetadata: z.object({
    keyTopics: z.array(z.string()),
    totalSources: z.number(),
    averageRelevance: z.number(),
  }),
});

// Schema for structured LLM output
const llmOutputSchema = z.object({
  synthesis: z.string(),
  topicFlow: z.array(z.string()),
  keyTopics: z.array(z.string()),
});

const description =
  "Creates a coherent synthesis from organized source content, generating a narrative flow and key topics";

export const createSynthesis = createTool({
  id: "createSynthesis",
  description,
  inputSchema,
  outputSchema,
  execute: async ({ context, mastra }) => {
    if (!mastra?.llm) throw new Error("LLM not available");
    const { sources, style, maxLength } = context;

    try {
      const llm = mastra.llm({
        provider: "ANTHROPIC",
        name: "claude-3-5-sonnet-20241022",
      });

      // Calculate metadata for context
      const totalSources = sources.length;
      const averageRelevance =
        sources.reduce((acc, src) => acc + src.relevance, 0) / totalSources;

      // Prepare content for synthesis
      const sortedSources = [...sources]
        .sort((a, b) => b.relevance - a.relevance)
        .map((source) => ({
          source: source.source,
          snippets: source.contentSnippets
            .sort((a, b) => b.relevance - a.relevance)
            .map((s) => s.text)
            .join("\n"),
        }));

      const result = await llm.generate(
        [
          {
            role: "system",
            content: `You are a content synthesizer creating ${style} content for a podcast. 
            Create a coherent synthesis from the provided sources, maintaining a natural flow 
            and identifying key topics. Limit the synthesis to approximately ${maxLength} characters.
            Focus on creating content that will be engaging in a spoken format.`,
          },
          {
            role: "user",
            content: `Sources to synthesize:\n${sortedSources
              .map((src) => `Source: ${src.source}\nContent:\n${src.snippets}`)
              .join("\n\n")}`,
          },
        ],
        {
          schema: llmOutputSchema,
        },
      );

      const { synthesis, topicFlow, keyTopics } = result.object;

      return {
        synthesis,
        topicFlow,
        contextMetadata: {
          keyTopics,
          totalSources,
          averageRelevance,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create synthesis: ${error.message}`);
      }
      throw new Error(`Failed to create synthesis: ${String(error)}`);
    }
  },
});
