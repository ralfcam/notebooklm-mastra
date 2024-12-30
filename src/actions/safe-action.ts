import { mastra } from "@/mastra";
import { db } from "@/db";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => {
    return z.object({
      name: z.string(),
    });
  },
  handleServerError: (e) => {
    console.error("[ACTION CLIENT ERROR]:", e.message);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
})
  .use(({ next }) => next({ ctx: { db } })) // add db instance to client context
  .use(({ next }) => next({ ctx: { mastra } })); // add mastra instance to client context
