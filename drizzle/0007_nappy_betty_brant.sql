ALTER TABLE "source_topics" RENAME COLUMN "sourceId" TO "source_id";--> statement-breakpoint
ALTER TABLE "sources" RENAME COLUMN "notebookId" TO "notebook_id";--> statement-breakpoint
ALTER TABLE "source_topics" DROP CONSTRAINT "source_topics_sourceId_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "sources" DROP CONSTRAINT "sources_notebookId_notebooks_id_fk";
--> statement-breakpoint
ALTER TABLE "source_topics" ADD CONSTRAINT "source_topics_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_notebook_id_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."notebooks"("id") ON DELETE cascade ON UPDATE no action;