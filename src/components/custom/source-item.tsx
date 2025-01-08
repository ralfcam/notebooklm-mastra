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
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { fetchNotebookSources } from "@/db/queries/sources";
import { useEffect, useState } from "react";
import { pollJobStatusAction } from "@/actions/pollJobStatusAction";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
// import { processUploadAction } from "@/actions/process-upload-action";
import { summarizeSourceAction } from "@/actions/summarize-source-action";

type SourceItemProps = Awaited<ReturnType<typeof fetchNotebookSources>>[number];
type SourceProcessingStatus =
  | "queued"
  | "parsed"
  | "summarizing"
  | "ready"
  | "failed";

export const SourceItem: React.FC<SourceItemProps> = ({
  sourceName,
  sourceSummary,
  sourceTopics,
  parsingJobs,
  sourceChunks,
  sourceId,
}) => {
  const parsingJob = parsingJobs[0];

  console.log({ parsingJobs });

  const [sourceProcessingStatus, setSourceProcessingStatus] =
    useState<SourceProcessingStatus>(
      parsingJob.status === "PENDING"
        ? "queued"
        : parsingJob.status === "SUCCESS"
          ? "parsed"
          : "failed",
    );

  const { execute: pollJobStatus } = useAction(pollJobStatusAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      if (data.status === "SUCCESS") {
        setSourceProcessingStatus("parsed");
      }
    },
  });

  useEffect(() => {
    if (sourceProcessingStatus !== "queued") return;

    const intervalId = setInterval(
      () => pollJobStatus({ jobId: parsingJob.jobId }),
      5000,
    );

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [parsingJob.jobId, pollJobStatus, sourceProcessingStatus]);

  const { execute: summarizeSource } = useAction(summarizeSourceAction, {
    onSuccess: ({ data }) => {
      console.log({ data });
    },
  });

  useEffect(() => {
    if (sourceProcessingStatus === "parsed") {
      summarizeSource({ sourceId, jobId: parsingJob.jobId });
    }
  }, [parsingJob.jobId, sourceId, sourceProcessingStatus, summarizeSource]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={sourceProcessingStatus !== "ready"}
          variant="secondary"
          className={cn(
            "w-full justify-start",
            sourceProcessingStatus === "parsed" && "animate-pulse",
          )}
        >
          <File />
          <span className="truncate">{sourceName}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="underline">{sourceName}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">AI summary: </span>
            {sourceSummary}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap">
          {sourceTopics?.map((topic) => (
            <Badge variant="default" key={topic}>
              {topic}
            </Badge>
          ))}
        </div>

        <div className="bg-secondary text-muted-foreground rounded">
          <p className="font-semibold p-2 text-sm">Content</p>
          <hr />
          <ScrollArea className="max-w-md">
            <ScrollArea className="p-2 h-96 text-sm">
              {sourceChunks?.map((c) => c.content).join("\n")}
            </ScrollArea>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
