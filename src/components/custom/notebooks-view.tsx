"use client";

import { useNewNotebook } from "@/hooks/use-new-notebook";
import { formatDate } from "@/lib/utils";
import { Plus, Loader, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Notebook } from "@/db/queries/notebooks";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { useAction } from "next-safe-action/hooks";
import { deleteNotebookAction } from "@/actions/delete-notebook";
import { toast } from "sonner";
import { useState } from "react";
import { UploadSources } from "./uploads/upload-sources";

interface NotebooksViewProps {
  notebooks: Notebook[];
}

export const NotebooksView: React.FC<NotebooksViewProps> = ({ notebooks }) => {
  const { execute, status } = useNewNotebook();

  const [notebookBeingDeleted, setNotebookBeingDeleted] = useState<
    string | null
  >(null);

  const { execute: deleteNotebook, status: deletionStatus } = useAction(
    deleteNotebookAction,
    {
      onSuccess: () => toast.success("Notebook deleted"),
      onError: () => toast.error("Failed to delete notebook"),
      onSettled: () => setNotebookBeingDeleted(null),
    },
  );

  const handleDeleteNotebook = async (notebookId: string) => {
    setNotebookBeingDeleted(notebookId);
    deleteNotebook({ notebookId });
  };

  return (
    <div className="bg-background w-full rounded-3xl p-12 space-y-8">
      <div className="space-y-6 border-b pb-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
          Welcome to Mastra&apos;s NotebookLM
        </h1>
        <h2 className="text-2xl">My notebooks</h2>
      </div>
      <div className="space-y-8">
        <UploadSources variant="default" />
        <ScrollArea className="h-[40vh]">
          <div className="grow flex flex-wrap content-start gap-8 w-full">
            {notebooks.map((notebook) => (
              <div key={notebook.id} className="relative group">
                <Link href={`/notebook/${notebook.id}`}>
                  <Card className="size-64">
                    <CardHeader>
                      <CardTitle className="truncate">
                        {notebook.name}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(new Date(notebook.createdAt))}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Button
                  className="group-hover:flex hidden absolute top-2 right-2"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeleteNotebook(notebook.id)}
                >
                  {deletionStatus === "executing" &&
                  notebookBeingDeleted === notebook.id ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <Trash />
                  )}
                  <span className="sr-only">Delete notebook</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
