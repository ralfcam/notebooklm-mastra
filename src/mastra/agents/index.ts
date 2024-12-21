import { Agent } from "@mastra/core";
import {
  knowledgeManagerInstructions,
  podcastGeneratorInstructions,
} from "../prompts";
import {
  chunkText,
  createSynthesis,
  createTalkingPoints,
  extractMainPoints,
  generateEmbeddings,
  generateEpisodeOutline,
  generatePodcastScript,
  organizeSources,
  parseAndChunkFile,
  queryEmbeddings,
  searchVectorContent,
  storeEmbeddings,
} from "../tools";

export const podcastGenerator = new Agent({
  name: "podcastGenerator",
  instructions: podcastGeneratorInstructions,
  model: {
    name: "claude-3-5-sonnet-20241022",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
  tools: {
    searchVectorContent,
    organizeSources,
    createSynthesis,
    extractMainPoints,
    generateEpisodeOutline,
    createTalkingPoints,
    generatePodcastScript,
  },
});

export const knowledgeManager = new Agent({
  name: "knowledgeManager",
  instructions: knowledgeManagerInstructions,
  model: {
    name: "claude-3-5-sonnet-20241022",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
  tools: {
    chunkText,
    parseAndChunkFile,
    generateEmbeddings,
    storeEmbeddings,
    queryEmbeddings,
    searchVectorContent,
  },
});
