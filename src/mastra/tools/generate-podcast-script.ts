import { createTool } from "@mastra/core";
import { z } from "zod";

export const generatePodcastScript = createTool({
  id: "generate-podcast-script",
  description: "Generate a podcast script from retrieved content",
  inputSchema: z.object({
    topic: z.string(),
    relevantContent: z.array(
      z.object({
        content: z.string(),
        similarity: z.number(),
        source: z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          url: z.string().optional(),
        }),
      }),
    ),
    format: z
      .object({
        host1Name: z.string().default("Alex"),
        host2Name: z.string().default("Sarah"),
        durationMinutes: z.number().default(10),
        style: z
          .enum(["casual", "professional", "educational"])
          .default("educational"),
      })
      .default({
        host1Name: "Alex",
        host2Name: "Sarah",
        durationMinutes: 10,
        style: "educational",
      }),
  }),
  execute: async ({ context, mastra }) => {
    const { topic, relevantContent, format } = context;
    const agent = mastra?.agents?.["transcript-generator"];

    if (!agent) throw new Error("Can't find an agent");

    // Prepare content for the agent
    const contentSummary = relevantContent
      .map(
        ({ content, source }) => `
        Content: ${content}
        Source: ${source.name} (${source.type})${source.url ? ` - ${source.url}` : ""}
      `,
      )
      .join("\n\n");

    // Ask the agent to generate the script
    const response = await agent.generate([
      {
        role: "user",
        content: `Generate a ${format.durationMinutes}-minute podcast script about "${topic}".
        
        Use this content as reference:
        ${contentSummary}
        
        Format the script as a conversation between ${format.host1Name} and ${format.host2Name}.
        Make it ${format.style} in style.
        
        Use the format:
        ${format.host1Name}: [dialogue]
        ${format.host2Name}: [dialogue]
        
        Make sure the conversation flows naturally and engagingly.`,
      },
    ]);

    return {
      script: response.experimental_output,
      metadata: {
        topic,
        format,
        sourcesUsed: relevantContent.map((r) => r.source.id),
      },
    };
  },
});
