"use client";

import { updateNotebookNameAction } from "@/actions/update-notebook-name";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface NotebookNameProps {
  initialName: string;
  notebookId: string;
}

export const NotebookName: React.FC<NotebookNameProps> = ({
  initialName,
  notebookId,
}) => {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { execute, status } = useAction(updateNotebookNameAction, {
    onSuccess: ({ data }) => {
      if (!data) {
        toast.error("Something went wrong");
        return;
      }

      toast.success("Notebook name updated successfully");
      setIsEditing(false);
    },
    onError: () => {},
  });

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          className="px-2"
          size="icon"
          onClick={() =>
            execute({
              name,
              notebookId,
            })
          }
        >
          <Save />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="px-2"
          onClick={() => setIsEditing(false)}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span>{name}</span>
      {isHovering && (
        <Button
          size="icon"
          className="absolute -top-2 -right-6 size-6"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          {status === "executing" ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Pencil className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
};
