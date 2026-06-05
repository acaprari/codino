# Project

## Purpose

Codino teaches fundamental programming concepts (variables, arithmetic, loops, conditionals) to children aged 7–8 through a narrative-driven game. The child writes a personal story at the start; an AI generates a 10-level adventure with coding challenges tailored to that story. Real text-based code — not drag-and-drop blocks — is the core mechanic.

## Non-scope

- No backend — the app is a pure static frontend; the user supplies their own Anthropic API key
- No user accounts or cloud saves — progress lives in `localStorage` only
- No mobile phone support (keyboard required for coding)
- No audio (v1)
- No multiplayer or social features (v1)
- No advanced language features: no functions, arrays, string manipulation beyond printing, or user input

## Tech stack

- **React 18 + TypeScript + Vite** — standard SPA setup; Vite chosen for fast dev iteration and straightforward GitHub Pages deployment
- **Tailwind CSS** — utility-first styling; child-friendly large elements achieved through Tailwind classes
- **Zustand** — minimal state management without Redux ceremony; single global store
- **CodeMirror 6 + Lezer** — professional code editor with a custom Lezer grammar for the Codino language; chosen over textarea because it provides syntax highlighting, error markers, and autocomplete without heavy implementation cost
- **Anthropic Claude API** — direct client-side calls using the user's own API key; no proxy needed because there is no backend
- **localStorage** — sole persistence layer; no database

## Architecture

Feature-based directory layout under `src/features/`, with shared business logic in `src/core/` and global state in `src/store/`. Each feature (map, editor, execution, story, settings) owns its components and hooks; `core/` holds the language parser/interpreter, API client, and CodeMirror configuration. This keeps features independently navigable without deep cross-directory imports.

## Dev commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Serve dist/ locally
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run build:grammar  # Rebuild Lezer parser after grammar changes
```
