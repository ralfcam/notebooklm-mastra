ALTER TABLE "parsing_jobs" DROP CONSTRAINT "parsing_jobs_source_id_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "parsing_jobs" ADD CONSTRAINT "parsing_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;