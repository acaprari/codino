# Story / Onboarding

A first-time player creates a story through the WelcomeStoryModal, which appears as a glass overlay over the workspace. Submitting the story closes the modal, triggers map generation, and immediately generates the first problem — so the player lands in a ready workspace.

## Decisions

### Single first-launch modal
`WelcomeStoryModal` combines the previously-separate welcome screen and story input into one modal. It appears whenever `initialStory` is empty (first launch, after Clear Progress).

### No dismiss before submitting
The modal has no close button, no backdrop click, no Escape. The player must enter a story to proceed.

### Story is capped at 500 characters
The textarea has `maxLength={500}` for hard browser-level enforcement; the API layer also validates length before any Claude call. Counter shown below the textarea.

### API key required before submitting
The "Start adventure" button is disabled when no API key is set. An amber note below the button directs the player to ⚙️ Settings. This prevents landing in a broken state where the map cannot generate.

### Settings accessible from the modal
An icon-only ⚙️ button (translucent fill, hairline border — the icon-only exception to visual-system INV-04) sits in the modal header and opens SettingsModal, allowing the player to set an API key and change language without dismissing the welcome flow.

### Example chips and AI ideas
**Static examples (always shown).** Three bilingual example chips below the textarea fill the textarea via click. They are hardcoded in WelcomeStoryModal's language map — no API call, always available regardless of API-key state.

**AI-generated ideas (button always visible).** The "Give me ideas 💡" button is always rendered. It is disabled (with a tooltip "Set an API key to use this feature") when no API key is set. When active, clicking it calls `generateStoryIdeas` (Sonnet, 4 ideas, see [[ai-integration]] INV-11) and renders the returned strings as green chips, each truncated to 40 characters for display. Clicking a chip fills the textarea with the full idea text.

Keeping the button visible-but-disabled preserves discoverability — the player can see the feature exists and understands what unlocks it.

### Idea generation is fire-and-forget
Errors from `generateStoryIdeas` are silently swallowed: a `catch {}` clears the loading state and renders no error UI. The player can simply retry or fall back to the static examples. This is acceptable because the feature is purely additive — failure costs nothing.

### Generation phase
After story submission, `generateMap` and then `generateProblem(level 1)` run in sequence. The modal closes immediately. The workspace shows a "Preparing your adventure…" loading state until both calls complete, at which point the first problem appears in the main area automatically — no player interaction required.

### Error path
If `generateMap` fails, `MapErrorModal` appears with "Try Again" and "Open Settings" actions. Retry calls `handleStorySubmit(initialStory)` again.

## Invariants

INV-01: WelcomeStoryModal appears whenever the store has no `initialStory`. It is the only path to set an `initialStory`.

INV-02: The story submitted is `.trim()`-ed.

INV-03: The submit button is disabled until the textarea contains non-whitespace.

INV-04: 500 characters is enforced at both the browser level (textarea maxLength) and the API layer.

INV-05: Map generation failure routes to MapErrorModal, never to a silently-empty map.

INV-06: The "Give me ideas" button is always rendered. It is disabled (not hidden) when `apiClient` is null, so the player can see the feature exists and understands an API key is needed.

INV-07: The "Start adventure" button is disabled when `apiClient` is null. Submitting a story without an API key would leave the player in a broken state.

INV-08: After successful story submission, `generateProblem` for level 1 is called immediately and automatically. The player never needs to interact with the map to start the game.

INV-09: `WelcomeStoryModal` reopens whenever `initialStory` becomes falsy in the store (e.g. after Clear Progress). This is enforced via a `useEffect` in `AuroraApp`, not by requiring every progress-clearing call site to explicitly set `welcomeOpen`.

INV-10: Clicking any chip (static example or AI-generated idea) fills the textarea with the chip's full text via `setStory`. The chip's display text may be truncated for layout, but the value written to the textarea is always the full string.

INV-11: Errors from `generateStoryIdeas` are caught silently in `handleGetIdeas`. The loading state is always cleared (try/finally); no error UI is rendered. The button remains usable for retry.
