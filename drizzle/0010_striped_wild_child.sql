ALTER TABLE "sources" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "embedding_index" ON "sources" USING ivfflat ("embedding" vector_cosine_ops);