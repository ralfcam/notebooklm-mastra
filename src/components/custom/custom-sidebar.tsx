import { Sidebar, SidebarContent, SidebarRail } from "../ui/sidebar";
import { PropsWithChildren, Suspense } from "react";
import {
  SidebarNotebooks,
  SidebarNotebooksSkeleton,
} from "./sidebar-notebooks";
import { CustomSidebarHeader } from "./custom-sidebar-header";

interface CustomSidebarProps {
  notebookId: string;
}

export const CustomSidebar: React.FC<PropsWithChildren<CustomSidebarProps>> = ({
  notebookId,
}) => {
  return (
    <Sidebar collapsible="icon">
      <CustomSidebarHeader />
      <hr />
      <SidebarContent className="p-2">
        <Suspense fallback={<SidebarNotebooksSkeleton />}>
          <SidebarNotebooks notebookId={notebookId} />
        </Suspense>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
