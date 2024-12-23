ALTER TABLE "sources" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "content" text;