"use client";

import { cn } from "@/lib/utils";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../ui/button";
import { NotebookName } from "./notebook-name";

interface NavbarProps {
  notebookName: string;
  notebookId: string;
}

export const Navbar: React.FC<NavbarProps> = ({ notebookName, notebookId }) => {
  const { isMobile, open } = useSidebar();

  const desktopOpen = !isMobile && open;
  const desktopClosed = !isMobile && !open;

  return (
    <nav
      className={cn(
        "border-b h-12 flex items-center gap-4 transition-all sticky top-0",
        desktopOpen &&
          "w-[calc(100vw-var(--sidebar-width))] ml-[var(--sidebar-width)]",
        desktopClosed &&
          "w-[calc(100vw-var(--sidebar-width-icon))] ml-[var(--sidebar-width-icon)]",
      )}
    >
      <SidebarTrigger>
        <Button size="icon">
          {open ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
      </SidebarTrigger>
      <NotebookName notebookId={notebookId} initialName={notebookName} />
    </nav>
  );
};
