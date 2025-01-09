import { FetchedNotebookSource } from "@/db/queries/sources";
import { SidebarMenuItem } from "../ui/sidebar";
import { SourceItem } from "./source-item";
import { cn } from "@/lib/utils";
import { UploadSources } from "./uploads/upload-sources";

interface OptimisticNotebooksProps {
  notebookSources: FetchedNotebookSource[];
  notebookId: string;
}
export const OptimisticNotebooks: React.FC<OptimisticNotebooksProps> = ({
  notebookSources,
  notebookId,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <UploadSources variant="sidebar" notebookId={notebookId} />
      <hr />
      {notebookSources?.map((source) => (
        <SidebarMenuItem
          key={source.id}
          className={cn(
            "list-none",
            !(
              source.processingStatus === "ready" ||
              source.processingStatus === "summarized"
            ) && "animate-pulse",
          )}
        >
          <SourceItem {...source} notebookId={notebookId} />
        </SidebarMenuItem>
      ))}
    </div>
  );
};
