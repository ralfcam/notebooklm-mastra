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
  const { open } = useSidebar();

  return (
    <nav
      className={cn(
        "border-b h-12 flex items-center gap-4 transition-all sticky top-0 w-full",
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
