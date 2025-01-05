"use client";

import { generatePodcastAction } from "@/actions/generate-podcast-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CheckCircle2, Headphones, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { TextStreamPart } from "ai";
import { pollPodcastAudio } from "@/actions/poll-podcast-audio";

interface StudioPanelProps {
  notebookId: string;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({ notebookId }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [res, setRes] = useState<TextStreamPart<any>[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [pollUrl, setPollUrl] = useState("");

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

  const { execute, status } = useAction(generatePodcastAction, {
    onError: () => {
      toast.error("Error generating podcast");
    },
    onSuccess: async ({ data }) => {
      if (data) {
        for await (const event of data.output) {
          setRes((prev) => [...prev, event]);

          if (
            event.type === "tool-result" &&
            event.toolName === "generatePodcast" &&
            !!event.result.pollUrl
          ) {
            setPollUrl(event.result.pollUrl);
          }
        }
        toast.success("Submitted podcast creation job");
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

  return (
    <div className="space-y-4 w-full max-w-3xl">
      {!!res.length && (
        <ScrollArea className="h-[30vh] w-full border rounded p-4 text-xs">
          <StreamProgress events={res} />
        </ScrollArea>
      )}

      {audioUrl && (
        <div className="w-full border rounded p-4 bg-gray-50">
          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <Button onClick={handleGenerate} className="min-w-36">
        {status === "idle" ? (
          <>
            <Headphones />
            <span>Generate podcast</span>
          </>
        ) : status === "executing" ||
          pollingStatus === "executing" ||
          pollingStatus === "idle" ? (
          <Loader2 className="animate-spin" />
        ) : status === "hasSucceeded" ? (
          <>
            <CheckCircle2 />
            <span>Podcast Generated</span>
          </>
        ) : (
          <span>Failed podcast generation</span>
        )}
      </Button>
    </div>
  );
};

interface StreamProgressProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: TextStreamPart<any>[];
}
const StreamProgress: React.FC<StreamProgressProps> = ({ events }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processedEvents = events.reduce<TextStreamPart<any>[]>(
    (acc, event) => {
      if (event.type === "text-delta") {
        const prevEvent = acc[acc.length - 1];

        if (prevEvent?.type === "text-delta") {
          prevEvent.textDelta += event.textDelta;
          return acc;
        }

        return [...acc, { type: "text-delta", textDelta: event.textDelta }];
      }

      if (event.type === "tool-result") {
        return acc.map((ev) => {
          if (ev.type === "tool-call" && ev.toolCallId === event.toolCallId) {
            return event;
          } else {
            return ev;
          }
        });
      }

      return [...acc, event];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [] as unknown[] as TextStreamPart<any>[],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderEvent = (event: TextStreamPart<any>, index: number) => {
    switch (event.type) {
      case "text-delta":
        return (
          <div key={index} className="whitespace-normal text-gray-800">
            {event.textDelta}
          </div>
        );

      case "tool-call":
        return (
          <Alert
            key={event.toolCallId}
            className="border-l-4 border-l-blue-500"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <AlertDescription className="font-medium text-xs">
                {event.toolName}
              </AlertDescription>
            </div>
          </Alert>
        );

      case "tool-result":
        return (
          <Alert
            key={event.toolCallId + "-result"}
            className="border-l-4 border-l-green-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="font-medium text-xs">
                {event.toolName} - Result
              </AlertDescription>
            </div>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 w-full">
      {processedEvents.map((event, index) => renderEvent(event, index))}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default StreamProgress;
