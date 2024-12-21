import { Step, Workflow } from "@mastra/core";
import { z } from "zod";

// Step to generate the podcast script
const createScript = new Step({
  id: "create-script",
  description: "Generate podcast script from context",
  execute: async ({ context, mastra }) => {
    const tools = mastra?.agents?.["transcriptGenerator"]?.tools;
    if (!tools) throw new Error("Cannot access tools");

    const executeGenerateScript = tools["generate-script"]?.execute;
    if (!executeGenerateScript)
      throw new Error("Generate script tool not found");

    return executeGenerateScript({
      mastra,
      context: context.machineContext?.triggerData,
    });
  },
});

// Step to generate the audio
const createAudio = new Step({
  id: "create-audio",
  description: "Generate podcast audio from script",
  execute: async ({ context, mastra }) => {
    const tools = mastra?.agents?.["transcriptGenerator"]?.tools;
    if (!tools) throw new Error("Cannot access tools");

    const executeGenerateAudio = tools["generate-podcast-audio"]?.execute;
    if (!executeGenerateAudio) throw new Error("Generate audio tool not found");

    if (
      context.machineContext?.stepResults.createTranscript.status === "failed"
    ) {
      throw new Error("Transcript creation failed");
    }

    const transcript =
      //@ts-expect-error just building it out
      context.machineContext?.stepResults?.createScript?.transcript;

    return executeGenerateAudio({
      mastra,
      context: {
        transcript,
      },
    });
  },
});

// Create and export the workflow
export const generatePodcast = new Workflow({
  name: "generatePodcast",
  triggerSchema: z.object({
    topic: z.string(),
    contextDocs: z.array(z.any()),
    duration: z.number().optional(),
  }),
})
  .step(createScript)
  .then(createAudio)
  .commit();
