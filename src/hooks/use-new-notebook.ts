import { createNotebookAction } from "@/actions/notebooks";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useNewNotebook = () => {
  const router = useRouter();

  return useAction(createNotebookAction, {
    onSuccess: ({ data }) => {
      if (data) router.push(`/notebook/${data.notebookId}`);
    },
    onError: () => {
      toast.error("Failed to create notebook. Something wen't wrong");
    },
  });
};
