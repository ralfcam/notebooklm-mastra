"use client";

import { NotebookSummary } from "@/db/queries/notebooks";

interface NotebookSummaryProps {
  notebookSummary: NotebookSummary;
}

export const NotebookSummarySection: React.FC<NotebookSummaryProps> = ({
  notebookSummary,
}) => {
  console.log(notebookSummary);
  return (
    <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
      <div className="text-4xl">{notebookSummary.emoji}</div>
      <h1 className="text-3xl font-semibold">{notebookSummary.title}</h1>
      <p className="text-sm text-muted-foreground">4 sources</p>
      <p className="text-sm">{notebookSummary.summary}</p>
    </div>
  );
};
