import { z } from "zod";

export const parseAndChunkFileInputSchema = z.object({
  file: z.instanceof(File),
});

export const chunkInputSchema = z.object({
  content: z.string(),
  contentType: z.enum(["text", "markdown"]),
});
