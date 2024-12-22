import { fetchNotebookSources } from "@/db/queries/sources";
import { SidebarContent, SidebarMenuItem } from "../ui/sidebar";
import { UploadSourceDialog } from "./upload-source-dialog";

interface SourcesPanelProps {
  notebookId: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = async ({
  notebookId,
}) => {
  const notebookSources = await fetchNotebookSources(notebookId);

  return (
    <SidebarContent className="flex flex-col gap-4">
      {notebookSources.map((source) => (
        <SidebarMenuItem key={source.id}>{source.id}</SidebarMenuItem>
      ))}
      <UploadSourceDialog
        notebookId={notebookId}
        initialOpen={notebookSources.length === 0}
      />
    </SidebarContent>
  );
};
