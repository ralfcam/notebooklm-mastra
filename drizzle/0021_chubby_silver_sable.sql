CREATE TYPE "public"."podcast_status" AS ENUM('not_started', 'querying_sources', 'generating_script', 'polling_audio', 'ready');--> statement-breakpoint
CREATE TABLE "notebook_podcast" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audioUrl" text,
	"podcastScript" text,
	"notebook_id" uuid
);
--> statement-breakpoint
ALTER TABLE "notebooks" ADD COLUMN "podcast_status" "podcast_status" DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE "notebook_podcast" ADD CONSTRAINT "notebook_podcast_notebook_id_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."notebooks"("id") ON DELETE cascade ON UPDATE cascade;