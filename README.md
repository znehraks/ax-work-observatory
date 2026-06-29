# AX Work Observatory

Newspaper-style AX research journal built with Next.js, Framer Motion, Remotion, and a data-driven research animation grammar.

The first screen presents ongoing AX research as a moving editorial dispatch rather than a conventional portfolio. Research topics are defined in `content/research.ts`, so the animated workflow diagram can be updated by replacing the manifest-style content instead of redesigning the page.

## Current Research Dispatches

- `AIDLC Studio`
- `Agent Conversation Logger`
- `Data-to-Content Workflow`
- `24/7 Agentic Task Automation`

## Motion System

The central dispatch image uses HTML workflow cards + Framer Motion by default:

- workflow columns are rendered from `input`, `process`, and `artifact`
- the return loop is rendered from `feedback`
- a motion token moves through the active research flow
- labels remain HTML for readability and easy replacement
- detailed project-specific mappings live behind `Frame Notes`

`24/7 Agentic Task Automation` additionally uses a rendered Remotion film at `public/media/agentic-task-automation.mp4`. It visualizes the Slack -> Jira -> Codex/OpenAI -> GitHub handoff as a readable pipeline.

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
