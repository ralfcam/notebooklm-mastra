ALTER TABLE "sources" ADD COLUMN "notebookId" uuid;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_notebookId_notebooks_id_fk" FOREIGN KEY ("notebookId") REFERENCES "public"."notebooks"("id") ON DELETE cascade ON UPDATE no action;
