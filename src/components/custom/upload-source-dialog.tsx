"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { FileUploader } from "./file-uploader";
import { parseAndChunkFileAction } from "@/actions/handleFiles";

interface UploadSourceDialogProps {
  initialOpen: boolean;
  notebookId: string;
}

export const UploadSourceDialog: React.FC<UploadSourceDialogProps> = ({
  initialOpen,
}) => {
  const [open, setOpen] = useState(initialOpen);
  const { open: sidebarOpen } = useSidebar();
  const [files, setFiles] = useState<File[]>([]);

  const onUpload = async (files: File[]) => {
    if (files.length !== 1) return;
    const buffer = await files[0].arrayBuffer();
    const fileName = files[0].name;

    const res = await parseAndChunkFileAction(buffer, fileName);

    console.log(res);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={sidebarOpen ? "outline" : "ghost"}>
          <Plus />
          <span className={sidebarOpen ? "" : "sr-only"}>Add source</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add sources</DialogTitle>
          <DialogDescription>Upload a source to the notebook</DialogDescription>
        </DialogHeader>
        <form>
          <FileUploader
            value={files}
            onValueChange={setFiles}
            onUpload={onUpload}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
