import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const sourceType = pgEnum("source_type", ["file", "text"]);

export const notebooks = pgTable("notebooks", {
  id: uuid().primaryKey().notNull(),
  name: text().default("Untitled Notebook").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const sources = pgTable("sources", {
  id: uuid().primaryKey().notNull(),
  type: sourceType().notNull(),
});
