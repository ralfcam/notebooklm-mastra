"use client";

import { Home } from "lucide-react";
import { Button } from "../ui/button";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import Link from "next/link";

export const CustomSidebarHeader = ({ sessionId }: { sessionId: string }) => {
  const { open } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <Button
            variant="link"
            className={open ? "w-9" : "w-full"}
            size="icon"
          >
            <Link
              href={`/?sessionId=${sessionId}`}
              className="flex items-center justify-center"
            >
              <Home className="" />
            </Link>
          </Button>
          <span className={open ? "" : "sr-only"}>Sources</span>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
