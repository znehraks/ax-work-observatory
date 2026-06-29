# AX Work Observatory

Newspaper-style AX research journal built with Next.js, Framer Motion, Remotion, and a data-driven research animation grammar.

The first screen presents ongoing AX research as a moving editorial dispatch rather than a conventional portfolio. Research topics are defined in `content/research.ts`, so the animated workflow diagram can be updated by replacing the manifest-style content instead of redesigning the page.

## Current Research Dispatches

- `AIDLC Studio`
- `Agent Conversation Logger`
- `Data-to-Content Workflow`
- `24/7 Agentic Task Automation`

## Motion System

The central dispatch image supports two readable motion layers:

- HTML workflow cards + Framer Motion, generated from `content/research.ts`
- rendered Remotion films for research dispatches that need a stronger timeline sequence
- detailed project-specific mappings behind `Frame Notes`

All four current dispatches use 7-second Remotion films in `public/media/`:

- `aidlc-studio.mp4`
- `agent-conversation-logger.mp4`
- `data-to-content-workflow.mp4`
- `agentic-task-automation.mp4`

See `docs/ax-work-observatory-spec.md` and `docs/implementation-notes.md` for the full concept history and implementation spec.

## Run

```bash
npm install
npm run dev
```

## Render Motion Assets

```bash
npm run remotion:render
```

## Verify

```bash
npm run lint
npm run build
```
