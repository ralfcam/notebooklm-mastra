ALTER TABLE "source_topics" ALTER COLUMN "source_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "summary" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "summary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "notebook_id" SET NOT NULL;