CREATE TABLE "source_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text,
	"sourceId" uuid,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "source_topics" ADD CONSTRAINT "source_topics_sourceId_sources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;