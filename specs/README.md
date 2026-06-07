# Codino — Specs

Codino is a narrative-driven coding education game for children aged 7–8. Players write real code in a simple bilingual mini-language while following an AI-generated adventure story.

## Capabilities

Each capability spec describes the current state of one functional area: the decisions that govern it, the rationale, and the invariants that hold.

- [project.md](project.md) — Purpose, non-scope, tech stack, architecture, dev commands
- [codino-language.md](codino-language.md) — The Codino mini-language: grammar, parser, interpreter, and execution model
- [ai-integration.md](ai-integration.md) — Claude API usage: map generation, problem generation, hints, ratings, prompt injection protection
- [game-state.md](game-state.md) — Zustand store, level progression, localStorage persistence
- [execution-engine.md](execution-engine.md) — Code execution pipeline, step-by-step animation, output validation
- [map-visualization.md](map-visualization.md) — Winding path map, branching structure, level nodes
- [editor.md](editor.md) — CodeMirror integration, syntax highlighting, theme, autocomplete
- [story-onboarding.md](story-onboarding.md) — Welcome screen, story input, map generation loading flow
- [settings.md](settings.md) — API key management, language preference, progress reset
- [visual-system.md](visual-system.md) — Aurora background, glass tokens, color roles, typography, buttons, labels

## Architectural decisions (ADRs)

Cross-cutting decisions that span multiple capabilities. ADRs capture **durable** decisions and the alternatives that were rejected.

- [ADR-001](adr/ADR-001-single-workspace-redesign.md) — Single-workspace, glass-aesthetic UI redesign · *Accepted 2026-06-06*