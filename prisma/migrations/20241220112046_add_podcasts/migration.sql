-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "audioUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'GENERATING',
    "format" JSONB NOT NULL,
    "sourcesUsed" TEXT[],
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);
