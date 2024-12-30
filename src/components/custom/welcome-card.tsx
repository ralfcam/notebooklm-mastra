"use client";

import { createNotebookAction } from "@/actions/notebooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Code, Download, FileText, Loader } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WelcomeCard() {
  const router = useRouter();

  const { execute, status } = useAction(createNotebookAction, {
    onSuccess: ({ data }) => {
      if (data) router.push(`/notebook/${data.notebookId}`);
    },
    onError: () => {
      toast.error("Failed to create notebook. Something wen't wrong");
    },
  });

  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-6xl font-bold mb-12 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
        Welcome to Mastra&apos;s NotebookLM
      </h1>
      <Card className="p-8 rounded-3xl">
        <CardHeader>
          <h2 className="text-3xl font-semibold mb-2">
            Create your first notebook
          </h2>
          <p className="text-muted-foreground">
            Mastra&apos;s NotebookLM is an AI-powered assistant that creates
            podcasts from the sources you upload
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Download className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your documents and Mastra&apos;s NotebookLM will surface
                key insights on the podcast episode
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Convert complex material into an easy-to-understand format like
                a podcast
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Code className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Built using{" "}
                <a
                  href="https://mastra.ai"
                  className="text-blue-500 hover:underline"
                >
                  Mastra.ai
                </a>
                , the open-source Typescript AI Framework
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="px-8 rounded-full w-36"
              onClick={() => execute({})}
            >
              {status === "executing" ? (
                <Loader className="animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
