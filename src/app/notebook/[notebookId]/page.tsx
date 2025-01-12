import { NotebookSummarySection } from "@/components/custom/notebook-summary";
import { StatusCard } from "@/components/custom/example-card";
import { StudioPanel } from "@/components/custom/studio-panel";
import {
  fetchNavbarName,
  fetchNotebookWithSources,
} from "@/db/queries/notebooks";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { Navbar } from "@/components/custom/navbar";
import { CSSProperties } from "react";

interface NotebookPageProps {
  params: Promise<{ notebookId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function NotebookPage({
  params,
  searchParams,
}: NotebookPageProps) {
  const notebookId = (await params).notebookId;
  const notebookWithSources = await fetchNotebookWithSources(notebookId);

  const sourcesStatus = notebookWithSources?.sources.map(
    (s) => s.processingStatus,
  );

  const allSourcesSummarized =
    sourcesStatus?.every((s) => s === "summarized") ?? false;

  const sidebarWidths = {
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
    "--sidebar-width-icon": "4rem",
  } as CSSProperties;

  const sessionId = (await searchParams).sessionId;

  if (!sessionId) return null;

  const notebookName = (await fetchNavbarName(notebookId, sessionId))[0].name;

  return (
    <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
      <CustomSidebar notebookId={notebookId} sessionId={sessionId} />
      <div className="w-full">
        <Navbar notebookName={notebookName} notebookId={notebookId} />
        <main>
          <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-8">
            <>
              <NotebookSummarySection
                notebookSummary={notebookWithSources}
                sourcesSummarized={allSourcesSummarized}
              />

              {notebookWithSources?.notebookStatus !== "ready" && (
                <StatusCard
                  sourcesStatus={sourcesStatus ?? []}
                  notebookStatus={notebookWithSources?.notebookStatus}
                />
              )}

              <StudioPanel
                notebookId={notebookId}
                audioUrl={
                  notebookWithSources?.notebookPodcast.find((p) => !!p.audioUrl)
                    ?.audioUrl ?? undefined
                }
                notebookStatus={notebookWithSources?.notebookStatus}
              />
            </>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
