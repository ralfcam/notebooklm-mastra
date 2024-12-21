import { db } from "@/db";
import { notebooks } from "../../../../drizzle/schema";

export const fetchNotebooks = async () => {
  return await db.select().from(notebooks);
};
