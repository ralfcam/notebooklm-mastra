CREATE TYPE "public"."source_type" AS ENUM('file', 'text');--> statement-breakpoint
CREATE TABLE "notebooks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Untitled Notebook',
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "source_type" NOT NULL
);
