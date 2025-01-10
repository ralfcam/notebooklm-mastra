import { NotebookSummarySection } from "@/components/custom/notebook-summary";
import { StatusCard } from "@/components/custom/status-card";
import { StudioPanel } from "@/components/custom/studio-panel";
import { fetchNotebookSummaries } from "@/db/queries/notebooks";
import { fetchNotebookSources } from "@/db/queries/sources";

interface NotebookPageProps {
  params: Promise<{ notebookId: string }>;
}

export default async function NotebookPage({ params }: NotebookPageProps) {
  const notebookId = (await params).notebookId;
  const sources = await fetchNotebookSources(notebookId);
  const sourcesSummarized = sources.every(
    (s) => s.processingStatus === "summarized",
  );
  const [notebookSummary] = await fetchNotebookSummaries(notebookId);

  return (
    <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-8">
      <StatusCard />
      {sources.length > 0 ? (
        <>
          <NotebookSummarySection
            notebookSummary={notebookSummary}
            sourcesSummarized={sourcesSummarized}
          />
          <StudioPanel notebookId={notebookId} />
        </>
      ) : (
        <div className="w-full max-w-3xl flex flex-col justify-center gap-3">
          <h1 className="text-3xl font-semibold">
            Upload sources to get started.
          </h1>
        </div>
      )}
    </div>
  );
}
