import { Sidebar, SidebarContent, SidebarRail } from "../ui/sidebar";
import { PropsWithChildren, Suspense } from "react";
import {
  SidebarNotebooks,
  SidebarNotebooksSkeleton,
} from "./sidebar-notebooks";

interface CustomSidebarProps {
  notebookId: string;
}

export const CustomSidebar: React.FC<PropsWithChildren<CustomSidebarProps>> = ({
  notebookId,
}) => {
  return (
    <Sidebar collapsible="icon">
      {/* <SidebarHeader className="flex-row items-center justify-start border-b"> */}
      {/*   <span className={cn("grow", !sidebarOpen && "sr-only")}>Sources</span> */}
      {/*   <SidebarTrigger> */}
      {/*     {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />} */}
      {/*   </SidebarTrigger> */}
      {/* </SidebarHeader> */}

      <SidebarContent className="p-2">
        <Suspense fallback={<SidebarNotebooksSkeleton />}>
          <SidebarNotebooks notebookId={notebookId} />
        </Suspense>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
