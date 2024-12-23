import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { SourcesPanel } from "@/components/custom/sources-panel";
import { StudioPanel } from "@/components/custom/studio-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CSSProperties } from "react";

export default async function NotebookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const sidebarWidths = {
    "--sidebar-width": "30rem",
    "--sidebar-width-mobile": "40rem",
    "--sidebar-width-icon": "4rem",
  } as CSSProperties;

  const notebookId = (await params).id;

  return (
    <div className="flex">
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar side="left" header="Sources">
          <SourcesPanel notebookId={notebookId} />
        </CustomSidebar>
      </SidebarProvider>
      <main className="grow">{children}</main>
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar side="right" header="Studio">
          <StudioPanel />
        </CustomSidebar>
      </SidebarProvider>
    </div>
  );
}
