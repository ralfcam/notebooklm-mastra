import { pollJobStatusAction } from "@/actions/sources/poll-job-status-action";
import { summarizeSourceAction } from "@/actions/sources/summarize-source-action";
import { SourceProcessingStatus } from "@/db/schema/sources";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { toast } from "sonner";

export const usePollForParsingJobStatus = ({
  jobId,
  notebookId,
  processingStatus,
  sourceId,
  sourceName,
}: {
  jobId: string;
  notebookId: string;
  processingStatus: SourceProcessingStatus;
  sourceId: string;
  sourceName: string;
}) => {
  const { execute: pollJobStatus } = useAction(pollJobStatusAction, {
    onSuccess: ({ data }) =>
      data?.status === "SUCCESS" &&
      toast.success(`${sourceName} parsed successfully`),
  });

  useEffect(() => {
    if (processingStatus !== "queued") return;

    const intervalId = setInterval(
      () => pollJobStatus({ jobId, notebookId, sourceId }),
      5000,
    );

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, notebookId, pollJobStatus, processingStatus, sourceId]);
};

export const useSummarizeSource = ({
  jobId,
  notebookId,
  processingStatus,
  sourceId,
  sourceName,
}: {
  jobId: string;
  notebookId: string;
  processingStatus: SourceProcessingStatus;
  sourceId: string;
  sourceName: string;
}) => {
  const { execute: summarizeSource } = useAction(summarizeSourceAction, {
    onSuccess: () => toast.success(`${sourceName} summarized successfully`),
  });

  useEffect(() => {
    if (processingStatus === "parsed") {
      summarizeSource({ sourceId, jobId, notebookId });
    }
  }, [jobId, notebookId, processingStatus, sourceId, summarizeSource]);
};

export const useProcessSource = ({
  jobId,
  notebookId,
  processingStatus,
  sourceId,
  sourceName,
}: {
  jobId: string;
  notebookId: string;
  processingStatus: SourceProcessingStatus;
  sourceId: string;
  sourceName: string;
}) => {
  usePollForParsingJobStatus({
    jobId,
    notebookId,
    processingStatus,
    sourceId,
    sourceName,
  });

  useSummarizeSource({
    jobId,
    notebookId,
    processingStatus,
    sourceId,
    sourceName,
  });
};
