import { fetchNotebookSources } from "@/db/queries/sources";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { OptimisticNotebooks } from "./optimistic-notebooks";

interface SidebarNotebooksProps {
  notebookId: string;
}
export const SidebarNotebooks: React.FC<SidebarNotebooksProps> = async ({
  notebookId,
}) => {
  const notebookSources = await fetchNotebookSources(notebookId);

  console.log({ notebookSources });

  return (
    <SidebarMenu>
      <OptimisticNotebooks notebookSources={notebookSources} />
    </SidebarMenu>
  );
};

export const SidebarNotebooksSkeleton: React.FC = async () => {
  return (
    <SidebarMenu>
      {Array.from({ length: 5 }).map((_, idx) => (
        <SidebarMenuItem key={idx}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

/*
 * Landing on the notebook page
 * - Get notebook sources and their job ids
 * - For each source:
 *   - Check job status for each source
 *   - If pending:
 *     - Poll for job status for each source
 *   - If success:
 *     - handle summary + topics generation
 *
 */
