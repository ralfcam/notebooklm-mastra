# Plan

<!--toc:start-->

- [Plan](#plan)
  - [Managing knowledge base](#managing-knowledge-base)
    - [Types of sources to consider](#types-of-sources-to-consider)
      - [Core considerations](#core-considerations)
      - [Secondary considerations](#secondary-considerations)
    - [Updating knowledge base](#updating-knowledge-base)
    - [Accessing knowledge base](#accessing-knowledge-base)
    - [Removing context from knowledge base](#removing-context-from-knowledge-base)
    <!--toc:end-->

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
