## Spec-driven development

This project follows spec-driven development.
Specs are the source of truth. Code is a derivative.

Before implementing any feature, bugfix, or refactor:
1. Read `specs/project.md`
2. Read any relevant capability spec in `specs/`
3. If no spec exists for the area you're touching, create one before writing code
4. If specs exist but are outdated, update them before writing code

Use the following skills:
- `spec:core` — core principles, always available as reference
- `spec:bootstrap` — starting a new project or capability
- `spec:maintain` — updating specs alongside a change
- `spec:capture` — capturing decisions from the current session
- `spec:infer` — recovering specs from an existing codebase
- `spec:validate` — auditing spec completeness and invariant coverage

Run `spec:validate` before considering any feature branch complete.

## Specs

- project.md — purpose, tech stack, architecture, dev commands
- visual-system.md — Aurora background, glass tokens, color roles, typography, buttons, labels
- map-visualization.md — horizontal bottom-bar map, 10-node strip, node states
- editor.md — CodeMirror setup, EditorPane composition, inline error cards
- story-onboarding.md — WelcomeStoryModal, story submission, map+problem auto-generation
- execution-engine.md — execution pipeline, mode state machine, validation, rating
- settings.md — SettingsModal, API key, language toggle, Clear Progress
