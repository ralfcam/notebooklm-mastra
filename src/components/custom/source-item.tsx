"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { File } from "lucide-react";
import { Badge } from "../ui/badge";
import { fetchNotebookSources } from "@/db/queries/sources";
import { cn } from "@/lib/utils";
import { useProcessSource } from "@/hooks/source-processing-hooks";

type SourceItemProps = Awaited<
  ReturnType<typeof fetchNotebookSources>
>[number] & { notebookId: string };

export const SourceItem: React.FC<SourceItemProps> = ({
  sourceName,
  sourceSummary,
  sourceTopics,
  parsingJobs,
  processingStatus,
  sourceId,
  notebookId,
}) => {
  const parsingJob = parsingJobs[0];

  useProcessSource({
    jobId: parsingJob.jobId,
    notebookId,
    processingStatus,
    sourceId,
    sourceName,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={processingStatus !== "summarized"}
          variant="secondary"
          className={cn(
            "w-full justify-start",
            processingStatus !== "summarized" && "animate-pulse",
          )}
        >
          <File />
          <span className="truncate">{sourceName}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="leading-normal tracking-normal">
            {sourceName}
          </DialogTitle>
          <DialogDescription>{sourceSummary}</DialogDescription>
        </DialogHeader>

        <hr />

        <div className="flex gap-2 flex-wrap">
          {sourceTopics?.map((topic) => (
            <Badge variant="default" key={topic}>
              {topic}
            </Badge>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
