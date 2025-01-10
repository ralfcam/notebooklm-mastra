import { TextStreamPart } from "ai";
import {
  FileSearch,
  FileText,
  ListTodo,
  Pencil,
  Save,
  Radio,
  Headphones,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";

export const STEPS = [
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

export const useSteps = ({
  audioUrl,
  completedSteps,
  currentStepIndex,
  pollUrl,
  res,
  setCurrentStepIndex,
  setCompletedSteps,
}: {
  audioUrl: string | null;
  completedSteps: Set<string>;
  currentStepIndex: number;
  pollUrl: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: TextStreamPart<any>[];
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
  setCompletedSteps: Dispatch<SetStateAction<Set<string>>>;
}) => {
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
};
