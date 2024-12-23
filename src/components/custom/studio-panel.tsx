"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { SidebarContent } from "../ui/sidebar";
import { generatePodcastAction } from "@/actions/generate-podcast-action";

interface StudioPanelProps {
  notebookId: string;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({ notebookId }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await generatePodcastAction(notebookId);
    setLoading(false);
  };

  return (
    <SidebarContent>
      <Button onClick={handleGenerate}>
        {loading ? "Loading..." : "Generate Podcast"}
      </Button>
    </SidebarContent>
  );
};
