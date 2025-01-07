CREATE TYPE "public"."parsing_status" AS ENUM('PENDING', 'SUCCESS', 'ERROR', 'PARTIAL_SUCCESS');--> statement-breakpoint
CREATE TABLE "parsing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobId" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"status" "parsing_status" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "summary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parsing_jobs" ADD CONSTRAINT "parsing_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
