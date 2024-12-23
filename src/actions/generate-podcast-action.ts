"use server";

import { fetchNotebookSources } from "@/db/queries/sources";
import { mastra } from "@/mastra";

export const generatePodcastAction = async (notebookId: string) => {
  const generatePodcastWorkflow = mastra.getWorkflow("generatePodcast");

  const sources = await fetchNotebookSources(notebookId);

  // testing with raw content from sources
  const source = sources[sources.length - 1];

  await generatePodcastWorkflow.execute({
    triggerData: {
      content: source.content,
      title: source.name,
    },
  });
};
