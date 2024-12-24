import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { FileUploader } from "./file-uploader";

interface UploadSourceDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpload: (files: File[]) => Promise<void>;
}

export const UploadSourceDialog: React.FC<UploadSourceDialogProps> = ({
  open,
  setOpen,
  onUpload,
}) => {
  const { open: sidebarOpen } = useSidebar();
  const [files, setFiles] = useState<File[]>([]);

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
