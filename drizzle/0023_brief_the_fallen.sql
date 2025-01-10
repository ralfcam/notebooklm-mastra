CREATE TYPE "public"."notebook_status" AS ENUM('awaiting_source_summaries', 'summarizing', 'ready');--> statement-breakpoint
ALTER TABLE "notebooks" ADD COLUMN "notebook_status" "notebook_status" DEFAULT 'awaiting_source_summaries';--> statement-breakpoint
ALTER TABLE "public"."sources" ALTER COLUMN "processing_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."processing_status" CASCADE;--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('queued', 'parsed', 'summarized');--> statement-breakpoint
ALTER TABLE "public"."sources" ALTER COLUMN "processing_status" SET DATA TYPE "public"."processing_status" USING "processing_status"::"public"."processing_status";
