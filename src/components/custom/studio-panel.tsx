"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { SidebarContent } from "../ui/sidebar";
import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

interface StudioPanelProps {
  notebookId: string;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({ notebookId }) => {
  const [result, setResult] = useState("");

  const { execute, status } = useAction(generatePodcastAction, {
    onError: () => toast.error("Error generating podcast"),
    onSuccess: ({ data }) => {
      toast.success("Generated podcast");
      setResult(JSON.stringify(data, null, 2));
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
      <pre>
        <code className="font-mono text-xs">{result}</code>
      </pre>
    </SidebarContent>
  );
};
