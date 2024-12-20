# Plan

<!--toc:start-->

- [Plan](#plan)
  - [Podcast Generation System](#podcast-generation-system)
    - [Core Components](#core-components)
      - [1. Content Processing](#1-content-processing)
      - [2. Script Generation](#2-script-generation)
      - [3. Audio Generation](#3-audio-generation)
    - [Implementation Steps](#implementation-steps)
  - [Managing knowledge base](#managing-knowledge-base)
    - [Types of sources to consider](#types-of-sources-to-consider)
      - [Core considerations](#core-considerations)
      - [Secondary considerations](#secondary-considerations)
    - [Updating knowledge base](#updating-knowledge-base)
    - [Accessing knowledge base](#accessing-knowledge-base)
    - [Removing context from knowledge base](#removing-context-from-knowledge-base)
<!--toc:end-->

## Podcast Generation System

### Core Components

#### 1. Content Processing
- [x] Use existing knowledge base workflow
- [x] Process input content into chunks
- [x] Generate embeddings for context retrieval

#### 2. Script Generation
- [x] Create transcript generator prompt
- [x] Implement script generation tool
- [x] Ensure proper formatting for Play AI

#### 3. Audio Generation
- [x] Implement Play AI integration tool
- [x] Handle async job processing
- [x] Support multiple speakers

### Implementation Steps

1. [x] Create Play AI integration tool
   - [x] Implement API client
   - [x] Handle authentication
   - [x] Manage async job status

2. [x] Enhance transcript generator
   - [x] Add specific prompt templates
   - [x] Ensure proper speaker formatting
   - [x] Add content retrieval capabilities

3. [x] Create podcast generation workflow
   - [x] Script generation step
   - [x] Audio synthesis step

4. [ ] Testing and validation
   - Test with sample content
   - Verify audio output
   - Document usage patterns

### Testing Plan

1. [ ] Basic Functionality Test
   - [ ] Test script generation with sample context
   - [ ] Verify speaker formatting
   - [ ] Test audio generation with sample script

2. [ ] Integration Test
   - [ ] Test complete workflow end-to-end
   - [ ] Verify all components work together
   - [ ] Check error handling

3. [ ] Environment Setup
   - [ ] Set up Play AI credentials
   - [ ] Configure Claude API access
   - [ ] Set up necessary environment variables:
     ```
     PLAYDIALOG_USER_ID=xxx
     PLAYDIALOG_SECRET_KEY=xxx
     ANTHROPIC_API_KEY=xxx
     ```

## Managing knowledge base

Managing knowledge base involves all necessary actions and processes for the agent to maintain it's knowledge base appropriately.
In our case, when new sources of context are added to the application, our agent should process that content and update the knowledge base accordingly.
The same should happen when sources are removed from the context.

### Types of sources to consider

#### Core considerations

- [ ] Document uploads
  - `llama_parse` seems like a great tool for general purpose parsing.
  - will handle wide array of file types and extract data. 1000 free pages a day
  - needs an api key from the service
  - [ ] PDF documents
  - [ ] Plain Text documents
  - [ ] Markdown documents
- [ ] Text input/Paste

#### Secondary considerations

- [ ] Links to web content
  - [ ] Web content
  - [ ] Video content from YouTube
    - [ ] Open source video transcription tool made during Vercel's hackathon some time back
- [ ] Audio files
  - [ ] Audio to text tool

### Updating knowledge base

This should be triggered when a user uploads content on the dashboard.

### Accessing knowledge base

### Removing context from knowledge base
