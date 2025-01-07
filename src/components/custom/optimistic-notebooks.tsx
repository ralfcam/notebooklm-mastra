"use client";

import { FetchedNotebookSource } from "@/db/queries/sources";
import { useParams } from "next/navigation";
import { SidebarMenuItem } from "../ui/sidebar";
import { SourceItem } from "./source-item";
import { cn } from "@/lib/utils";
import { UploadSources } from "./uploads/upload-sources";

interface OptimisticNotebooksProps {
  notebookSources: FetchedNotebookSource[];
}
export const OptimisticNotebooks: React.FC<OptimisticNotebooksProps> = ({
  notebookSources,
}) => {
  const { notebookId }: { notebookId: string } = useParams();

  return (
    <div className="flex flex-col gap-4">
      <UploadSources variant="sidebar" notebookId={notebookId} />
      <hr />
      {notebookSources?.map((source) => (
        <SidebarMenuItem key={source.sourceId} className={cn("list-none")}>
          <SourceItem {...source} />
        </SidebarMenuItem>
      ))}
    </div>
  );
};
