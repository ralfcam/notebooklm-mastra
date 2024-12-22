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

interface UploadSourceDialogProps {
  initialOpen: boolean;
  notebookId: string;
}

export const UploadSourceDialog: React.FC<UploadSourceDialogProps> = ({
  initialOpen,
}) => {
  const [open, setOpen] = useState(initialOpen);
  const { open: sidebarOpen } = useSidebar();

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
          <FileUploader />
        </form>
      </DialogContent>
    </Dialog>
  );
};
