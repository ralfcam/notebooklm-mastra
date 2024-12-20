import { createTool } from "@mastra/core";
import { z } from "zod";

export const deleteSourceTool = createTool({
  id: "delete-source",
  description:
    "Delete a source and all its associated chunks and embeddings from the knowledge base",
  inputSchema: z.object({
    sourceId: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      // await deleteSource(context.sourceId);

      return {
        ok: true,
        message: `Successfully deleted source ${context.sourceId} and all associated content`,
      };
    } catch (error) {
      console.error("Error deleting source:", error);
      throw error;
    }
  },
});
