import { fetchNotebookSources } from "@/db/queries/sources";
import { SidebarContent, SidebarMenuItem } from "../ui/sidebar";
import { UploadSourceDialog } from "./upload-source-dialog";
import { SourceItem } from "./source-item";

interface SourcesPanelProps {
  notebookId: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = async ({
  notebookId,
}) => {
  const notebookSources = await fetchNotebookSources(notebookId);

  return (
    <SidebarContent className="flex flex-col gap-4">
      <UploadSourceDialog
        notebookId={notebookId}
        initialOpen={notebookSources.length === 0}
      />
      <hr />
      <div className="flex flex-col gap-2">
        {notebookSources.map((source) => (
          <SidebarMenuItem key={source.id} className="list-none">
            <SourceItem
              name={source.name ?? ""}
              summary={source.summary ?? ""}
              content={source.content ?? ""}
              keyTopics={source.sourceTopics.map((t) => t.topic ?? "")}
            />
          </SidebarMenuItem>
        ))}
      </div>
    </SidebarContent>
  );
};
