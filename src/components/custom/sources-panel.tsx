"use client";

import { FetchedNotebookSources } from "@/db/queries/sources";
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
  notebookSources: FetchedNotebookSources;
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
            id: "optimistic",
            name: newNotebookSource.triggerData.fileName,
            notebookId: newNotebookSource.triggerData.notebookId,
            content: "",
            summary: "",
            type: "file" as const,
            updatedAt: new Date(),
            createdAt: new Date(),
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
            key={source.id}
            className={cn(
              "list-none",
              source.id === "optimistic" && "animate-pulse",
            )}
          >
            <SourceItem
              name={source.name ?? ""}
              summary={source.summary ?? ""}
              content={source.content ?? ""}
              keyTopics={source.sourceTopics.map((t) => t.topic ?? "")}
              disabled={source.id === "optimistic"}
            />
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarContent>
  );
};
