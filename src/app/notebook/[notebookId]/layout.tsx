import { CustomSidebar } from "@/components/custom/custom-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  } as CSSProperties;
  const notebookId = (await params).notebookId;

  return (
    <div className="flex">
      <SidebarProvider className="w-auto" style={{ ...sidebarWidths }}>
        <CustomSidebar notebookId={notebookId} />
        <SidebarInset>
          <main className="grow">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
