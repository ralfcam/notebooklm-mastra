"use client";

import { NotebookSummary } from "@/db/queries/notebooks";
import { Skeleton } from "../ui/skeleton";

interface NotebookSummaryProps {
  notebookSummary: NotebookSummary;
}

export const NotebookSummarySection: React.FC<NotebookSummaryProps> = ({
  notebookSummary,
}) => {
  return (
    <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
      <div className="text-4xl">{notebookSummary.emoji}</div>
      <h1 className="text-3xl font-semibold">{notebookSummary.title}</h1>
      <p className="text-sm">{notebookSummary.summary}</p>
    </div>
  );
};

export const NotebookSummarySectionSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-7 w-96" />
      <Skeleton className="h-40" />
    </div>
  );
};
