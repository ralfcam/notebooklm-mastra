"use client";

import { NotebookSummary } from "@/db/queries/notebooks";
import { Skeleton } from "../ui/skeleton";
import { useAction } from "next-safe-action/hooks";
import { generateNotebookSummaries } from "@/actions/generate-notebook-summaries";
import { useEffect } from "react";
import { toast } from "sonner";

interface NotebookSummaryProps {
  notebookSummary: NotebookSummary;
  sourcesReady: boolean;
  sourcesSummarized: boolean;
}

export const NotebookSummarySection: React.FC<NotebookSummaryProps> = ({
  notebookSummary,
  sourcesReady,
  sourcesSummarized,
}) => {
  const { execute } = useAction(generateNotebookSummaries, {
    onSuccess: () => toast.success("Notebook summary generated"),
  });

  useEffect(() => {
    if (sourcesSummarized && !sourcesReady) {
      execute({ notebookId: notebookSummary.id });
    }
  }, [execute, notebookSummary.id, sourcesReady, sourcesSummarized]);

  if (sourcesReady) {
    return (
      <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
        <div className="text-4xl">{notebookSummary?.emoji}</div>
        <h1 className="text-3xl font-semibold">{notebookSummary?.title}</h1>
        <p className="text-sm">{notebookSummary?.summary}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-7 w-96" />
      <Skeleton className="h-40" />
    </div>
  );
};
