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
  saveSource,
  storeEmbeddings,
} from "../tools";
import {
  querySourceChunksEmbeddings,
  querySourceSummaryEmbeddings,
} from "./orchestrator/tools";

export const podcastGenerator = new Agent({
  name: "podcastGenerator",
  instructions: podcastGeneratorInstructions,
  model: {
    name: "claude-3-5-sonnet-20241022",
    provider: "ANTHROPIC",
    toolChoice: "auto",
  },
  tools: {
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
    saveSource,
    generateEmbeddings,
    storeEmbeddings,
    querySourceSummaryEmbeddings,
    querySourceChunksEmbeddings,
  },
});
