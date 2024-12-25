CREATE TABLE "source_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"source_id" uuid,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sources" RENAME COLUMN "embedding" TO "summary_embedding";--> statement-breakpoint
DROP INDEX "embedding_index";--> statement-breakpoint
ALTER TABLE "source_chunks" ADD CONSTRAINT "source_chunks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunk_embedding_index" ON "source_chunks" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "summary_embedding_index" ON "sources" USING ivfflat ("summary_embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "content";--> statement-breakpoint
DROP TYPE "public"."source_type";