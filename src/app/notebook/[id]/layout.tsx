import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { SourcesPanel } from "@/components/custom/sources-panel";
import { StudioPanel } from "@/components/custom/studio-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CSSProperties } from "react";

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarWidths = {
    "--sidebar-width": "30rem",
    "--sidebar-width-mobile": "40rem",
    "--sidebar-width-icon": "4rem",
  } as CSSProperties;

  return (
    <div className="flex">
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar side="left" header="Sources">
          <SourcesPanel />
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
