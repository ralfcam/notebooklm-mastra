"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { SidebarContent } from "../ui/sidebar";
import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface StudioPanelProps {
  notebookId: string;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({ notebookId }) => {
  const [res, setRes] = useState("");

  const { execute, status } = useAction(generatePodcastAction, {
    onError: ({ error }) => {
      toast.error("Error generating podcast");
      setRes(JSON.stringify(error, null, 2));
    },
    onSuccess: ({ data }) => {
      toast.success("Generated podcast");
      setRes(data ?? "data is undefined");
    },
  });

  const handleGenerate = () =>
    execute({
      triggerData: { notebookId },
      pathToRevalidate: `/notebook/${notebookId}`,
    });

  return (
    <SidebarContent>
      <Button onClick={handleGenerate}>
        {status === "executing" ? "Loading..." : "Generate Podcast"}
      </Button>
      <ScrollArea>
        <ScrollArea className="h-[80vh] border text-xs">
          <pre>
            <code>{res}</code>
          </pre>
        </ScrollArea>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </SidebarContent>
  );
};
