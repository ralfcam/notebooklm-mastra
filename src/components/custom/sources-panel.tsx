"use client";

import { FetchedNotebookSource } from "@/db/queries/sources";
import { SidebarContent, SidebarMenuItem } from "../ui/sidebar";
import { UploadSourceDialog } from "./upload-source-dialog";
import { SourceItem } from "./source-item";
import { processUploadAction } from "@/actions/process-upload-action";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface SourcesPanelProps {
  notebookSources: FetchedNotebookSource[];
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  notebookSources,
}) => {
  const { notebookId }: { notebookId: string } = useParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notebookSources?.length === 0) setOpen(true);
  }, [notebookSources?.length]);

  const { execute, optimisticState } = useOptimisticAction(
    processUploadAction,
    {
      currentState: { notebookSources },
      onError: ({ input }) => {
        setOpen(true);
        toast.error(`Error processing file ${input.triggerData.fileName}`);
      },
      onSuccess: () => {
        toast.success(`Processed file!`);
      },
      updateFn: (state, newNotebookSource) => ({
        notebookSources: [
          ...state.notebookSources,
          {
            sourceId: "optimistic",
            sourceName: newNotebookSource.triggerData.fileName,
            notebookId: newNotebookSource.triggerData.notebookId,
            sourceSummary: "",
            sourceChunks: [],
            sourceTopics: [],
          },
        ],
      }),
    },
  );

  const onUpload = async (files: File[]) => {
    if (files.length !== 1) return;

    const buffer = await files[0].arrayBuffer();
    const fileName = files[0].name;

    execute({
      triggerData: {
        fileName,
        buffer,
        notebookId,
      },
      pathToRevalidate: `/notebook/${notebookId}`,
    });

    setOpen(false);
  };

  return (
    <SidebarContent className="flex flex-col gap-4">
      <UploadSourceDialog onUpload={onUpload} open={open} setOpen={setOpen} />
      <hr />
      <div className="flex flex-col gap-2">
        {optimisticState.notebookSources?.map((source) => (
          <SidebarMenuItem
            key={source.sourceId}
            className={cn(
              "list-none",
              source.sourceId === "optimistic" && "animate-pulse",
            )}
          >
            <SourceItem
              name={source.sourceName ?? ""}
              summary={source.sourceSummary ?? ""}
              content={source.sourceChunks.map((c) => c.content).join("")}
              keyTopics={source.sourceTopics.map((t) => t ?? "")}
              disabled={source.sourceId === "optimistic"}
            />
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarContent>
  );
};
