"use client";

import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  FileSearch,
  FileText,
  Headphones,
  ListTodo,
  Loader2,
  Pencil,
  Radio,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TextStreamPart } from "ai";
import { pollPodcastAudio } from "@/actions/poll-podcast-audio";
import { submitAudioGenerationAction } from "@/actions/submit-audio-generation-action";
import { cn } from "@/lib/utils";

interface StudioPanelProps {
  notebookId: string;
}

const STEPS = [
  {
    id: "validateSourcesAvailability",
    title: "Validate Sources",
    description: "Checking source availability",
    icon: FileSearch,
  },
  {
    id: "querySourceSummaryAndChunks",
    title: "Query Sources",
    description: "Analyzing source content",
    icon: FileText,
  },
  {
    id: "generatePodcastOutline",
    title: "Generate Outline",
    description: "Creating podcast structure",
    icon: ListTodo,
  },
  {
    id: "generatePodcastScript",
    title: "Generate Script",
    description: "Writing podcast script",
    icon: Pencil,
  },
  {
    id: "savePodcastDetails",
    title: "Save Details",
    description: "Saving podcast information",
    icon: Save,
  },
  {
    id: "audioGeneration",
    title: "Generate Audio",
    description: "Converting to audio",
    icon: Radio,
  },
  {
    id: "complete",
    title: "Ready for Playback",
    description: "Your podcast is ready to play",
    icon: Headphones,
  },
];

export const StudioPanel: React.FC<StudioPanelProps> = ({ notebookId }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [res, setRes] = useState<TextStreamPart<any>[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [pollUrl, setPollUrl] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    const processEvents = () => {
      const newCompletedSteps = new Set(completedSteps);
      let latestStepIndex = currentStepIndex;

      res.forEach((event) => {
        if (event.type === "tool-call") {
          const stepIndex = STEPS.findIndex(
            (step) => step.id === event.toolName,
          );
          if (stepIndex > -1) {
            latestStepIndex = stepIndex;
          }
        } else if (event.type === "tool-result") {
          const stepIndex = STEPS.findIndex(
            (step) => step.id === event.toolName,
          );
          if (stepIndex > -1) {
            newCompletedSteps.add(event.toolName);
          }
        }
      });

      if (pollUrl && !audioUrl) {
        latestStepIndex = STEPS.findIndex(
          (step) => step.id === "audioGeneration",
        );
      }
      if (audioUrl) {
        latestStepIndex = STEPS.findIndex((step) => step.id === "complete");
        newCompletedSteps.add("audioGeneration");
        newCompletedSteps.add("complete");
      }

      setCurrentStepIndex(latestStepIndex);
      setCompletedSteps(newCompletedSteps);
    };

    processEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, pollUrl, audioUrl]);

  const { execute: executePolling, status: pollingStatus } = useAction(
    pollPodcastAudio,
    {
      onError: () => toast.error("Error polling podcast"),
      onSuccess: ({ data }) => {
        if (data?.audioUrl) {
          setAudioUrl(data.audioUrl);
          toast.success("Podcast audio available");
        }
      },
    },
  );

  const { execute: submitForAudioProduction } = useAction(
    submitAudioGenerationAction,
    {
      onSuccess: ({ data }) => {
        if (data?.pollUrl) {
          setPollUrl(data.pollUrl);
        }
      },
    },
  );

  const { execute, status } = useAction(generatePodcastAction, {
    onError: () => {
      toast.error("Error generating podcast");
    },
    onSuccess: async ({ data }) => {
      if (data) {
        for await (const event of data.output) {
          setRes((prev) => [...prev, event]);
          console.dir(event, { depth: Infinity });

          if (
            event.type === "tool-result" &&
            event.toolName === "savePodcastDetails" &&
            !!event.result[0].podcastScript
          ) {
            submitForAudioProduction({ script: event.result[0].podcastScript });
          }
        }
      }
    },
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (pollUrl && !audioUrl) {
      intervalId = setInterval(() => {
        executePolling({ pollUrl });
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollUrl, audioUrl, executePolling]);

  const handleGenerate = () =>
    execute({
      triggerData: { notebookId },
      pathToRevalidate: `/notebook/${notebookId}`,
    });

  const isProcessing =
    status === "executing" ||
    pollingStatus === "executing" ||
    (!!pollUrl && !audioUrl);

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <div className="w-full">
        <div className="flex items-start border rounded-3xl py-8">
          {STEPS.map((step, index) => {
            const isComplete = completedSteps.has(step.id);
            const isCurrent = currentStepIndex === index;
            const isPending = currentStepIndex < index;

            return (
              <div key={step.id} className="flex flex-col gap-2 relative grow">
                <div className="flex items-center justify-center">
                  <div
                    className={cn(
                      "h-0.5 grow",
                      index > 0 && isComplete
                        ? "bg-green-200"
                        : index > 0
                          ? "bg-gray-200"
                          : "",
                      "transition-colors duration-200",
                    )}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      isCurrent
                        ? "bg-blue-100"
                        : isComplete
                          ? "bg-green-100"
                          : "bg-gray-100"
                    }
                    transition-colors duration-200`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <step.icon
                        className={`w-5 h-5 
                        ${isCurrent ? "text-blue-600 animate-pulse" : "text-gray-400"}`}
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "h-0.5 grow",
                      index < STEPS.length - 1 && isComplete
                        ? "bg-green-200"
                        : index < STEPS.length - 1
                          ? "bg-gray-200"
                          : "",
                      "transition-colors duration-200",
                    )}
                  />
                </div>
                <div className="text-center">
                  <h3
                    className={`font-medium text-[10px] ${
                      isCurrent
                        ? "text-blue-600"
                        : isComplete
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {audioUrl && (
        <div className="w-full border rounded p-4 bg-gray-50">
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        className="min-w-36"
        disabled={isProcessing}
      >
        {status === "idle" ? (
          <>
            <Headphones className="mr-2" />
            <span>Generate podcast</span>
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            <span>Processing...</span>
          </>
        ) : status === "hasSucceeded" ? (
          <>
            <CheckCircle2 className="mr-2" />
            <span>Podcast Generated</span>
          </>
        ) : (
          <span>Failed podcast generation</span>
        )}
      </Button>
    </div>
  );
};
