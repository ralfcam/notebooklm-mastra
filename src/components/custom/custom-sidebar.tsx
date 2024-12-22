"use client";

import {
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { PropsWithChildren } from "react";

interface CustomSidebarProps {
  side: "left" | "right";
  header: string;
}
export const CustomSidebar: React.FC<PropsWithChildren<CustomSidebarProps>> = ({
  children,
  header,
  side,
}) => {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader className="flex-row items-center border-b justify-center">
        <span className={`grow ${!open ? "sr-only" : ""}`}>{header}</span>
        <SidebarTrigger>
          {side === "left" ? (
            open ? (
              <PanelLeftClose />
            ) : (
              <PanelLeft />
            )
          ) : open ? (
            <PanelRightClose />
          ) : (
            <PanelRight />
          )}
        </SidebarTrigger>
      </SidebarHeader>
      <div className="p-2">{children}</div>
      <SidebarRail />
    </Sidebar>
  );
};
