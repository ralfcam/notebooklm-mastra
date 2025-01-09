CREATE TABLE "source_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summary" text,
	"summary_embedding" vector(1536),
	"source_id" uuid
);
--> statement-breakpoint
DROP INDEX "summary_embedding_index";--> statement-breakpoint
ALTER TABLE "source_summaries" ADD CONSTRAINT "source_summaries_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "summary_embedding_index" ON "source_summaries" USING ivfflat ("summary_embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "summary";--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "summary_embedding";