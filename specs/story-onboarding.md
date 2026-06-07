# Story / Onboarding

A first-time player creates a story through the WelcomeStoryModal, which appears as a glass overlay over the workspace. Submitting the story closes the modal, triggers map generation, and populates the map bar.

## Decisions

### Single first-launch modal
`WelcomeStoryModal` combines the previously-separate welcome screen and story input into one modal. It appears whenever `initialStory` is empty (first launch, after Clear Progress).

### No dismiss before submitting
The modal has no close button, no backdrop click, no Escape. The player must enter a story to proceed.

### Story is capped at 500 characters
The textarea has `maxLength={500}` for hard browser-level enforcement; the API layer also validates length before any Claude call. Counter shown below the textarea.

### Example chips and AI ideas
Three static bilingual example chips are always shown. When an API client is available, a "Give me ideas 💡" link appears; clicking it calls `generateStoryIdeas` and renders the returned ideas as green chips above the static purple example chips.

### Generation phase
After story submission, `generateMap` runs asynchronously. The modal closes immediately so the player sees the workspace. The map bar shows all-locked nodes until generation completes.

### Error path
If `generateMap` fails, `MapErrorModal` appears with "Try Again" and "Open Settings" actions. Retry calls `handleStorySubmit(initialStory)` again.

## Invariants

INV-01: WelcomeStoryModal appears whenever the store has no `initialStory`. It is the only path to set an `initialStory`.

INV-02: The story submitted is `.trim()`-ed.

INV-03: The submit button is disabled until the textarea contains non-whitespace.

INV-04: 500 characters is enforced at both the browser level (textarea maxLength) and the API layer.

INV-05: Map generation failure routes to MapErrorModal, never to a silently-empty map.

INV-06: The "Give me ideas" button is hidden when `apiClient` is null.
