ALTER TABLE "sources" ADD COLUMN "processing_status" "processing_status" DEFAULT 'queued' NOT NULL;--> statement-breakpoint
ALTER TABLE "source_topics" DROP COLUMN "processing_status";