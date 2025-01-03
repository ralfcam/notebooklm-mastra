import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { Navbar } from "@/components/custom/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { fetchNavbarName } from "@/db/queries/notebooks";
import { CSSProperties, PropsWithChildren } from "react";

interface NotebookLayoutProps {
  params: Promise<{ notebookId: string }>;
}

export default async function NotebookLayout({
  children,
  params,
}: PropsWithChildren<NotebookLayoutProps>) {
  const sidebarWidths = {
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
    "--sidebar-width-icon": "4rem",
  } as CSSProperties;
  const notebookId = (await params).notebookId;
  const notebookName = (await fetchNavbarName(notebookId))[0].name;

  return (
    <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
      <CustomSidebar notebookId={notebookId}></CustomSidebar>
      <div className="w-full">
        <Navbar notebookName={notebookName} notebookId={notebookId} />
        <main>{children}</main>
      </div>
    </SidebarProvider>
  );
}
