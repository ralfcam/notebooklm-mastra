import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { SourcesPanel } from "@/components/custom/sources-panel";
import { StudioPanel } from "@/components/custom/studio-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { fetchNotebookSources } from "@/db/queries/sources";
import { CSSProperties } from "react";

export default async function NotebookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ notebookId: string }>;
}) {
  const sidebarWidths = {
    "--sidebar-width": "70rem",
    "--sidebar-width-mobile": "40rem",
    "--sidebar-width-icon": "4rem",
  } as CSSProperties;

  const notebookId = (await params).notebookId;
  const notebookSources = await fetchNotebookSources(notebookId);

  return (
    <div className="flex">
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar side="left" header="Sources">
          <SourcesPanel notebookSources={notebookSources} />
        </CustomSidebar>
      </SidebarProvider>
      <main className="grow">{children}</main>
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar side="right" header="Studio">
          <StudioPanel notebookId={notebookId} />
        </CustomSidebar>
      </SidebarProvider>
    </div>
  );
}
