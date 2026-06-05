# Story / Onboarding

The onboarding flow is the path a new player takes before reaching the map: a welcome screen, a story creation screen, and a loading screen while the AI generates the map. For returning players with saved progress the flow is skipped entirely and they land directly on the map (or editor if mid-level).

## Decisions

### On load, skip onboarding for players with saved progress
The initial screen is derived from the store's persisted state, not hardcoded to `'welcome'`:
- If `currentProblem` is set (restored from `codino_current_level`) → start on `'editor'`
- If `initialStory` is set → start on `'map'`
- Otherwise → start on `'welcome'`

This ensures a player who refreshes mid-game returns exactly where they left off.

### Onboarding has three steps: welcome → story input → generating
After the player submits a story, the screen transitions to `'generating'` immediately so feedback is instant, while `generateMap` runs in the background. When the call resolves (success or failure), the screen transitions to `'map'`. If the call fails the map still appears, showing "Generating map…" — the branching visualization degrades gracefully until branches are available.

### Story is capped at 500 characters, enforced at two layers
The `<textarea>` carries `maxLength={500}` to prevent overflow in the UI. `validateStoryInput` in the API layer enforces the same limit and throws on violation. The character counter (`story.length / 500`) gives the child live feedback. The "Start Adventure" button is disabled until at least one non-whitespace character is entered.

### Example prompts fill the textarea with a single click
Three bilingual example chips appear below the textarea. Clicking one sets the full example text as the story value. The chip label is truncated to the first clause (`...`-split) to save space while the full text is inserted. The player can edit after clicking.

### Inline bilingual text, no translation library
Both `WelcomeScreen` and `StoryInput` carry their own `{ it: {...}, en: {...} }` text map and read `language` from the store. This avoids a translation library dependency for a two-language app with a small and stable string set.

### Language toggle is always visible during onboarding
The toggle lives in `Navbar` (rendered by `AppLayout`), which wraps all screens including welcome and story input. The player can switch language at any point — the text updates immediately because both components derive their display strings from the store's `language` field.

### "Give me ideas" calls `generateStoryIdeas` and renders AI idea chips
`StoryInput` accepts an optional `onGetIdeas?: () => Promise<string[]>` prop. When provided (i.e., an API client is available in `App.tsx`), a "Give me ideas 💡" / "Dammi un'idea 💡" link appears next to the character counter. Clicking it calls `generateStoryIdeas({ language })`, shows a brief loading label, and on success renders the returned ideas as green chips above the static example chips. Clicking any chip fills the textarea with that idea (editable). If the call fails it is swallowed silently and the button resets.

`ClaudeAPIClient.generateStoryIdeas` sends no user-provided content — the `user` message is the fixed string "Generate 4 story ideas." The system prompt specifies language, age-appropriateness, and the JSON output format. Because no user data is in the prompt, no injection protection is required for this call.

## Invariants

INV-01: The `'welcome'` and `'story'` screens are only shown when `initialStory` is empty and `currentProblem` is null. A player with saved progress never sees the onboarding screens on reload.

INV-02: The `'generating'` screen is shown between the player clicking "Start Adventure" and the map appearing. It is never skipped, even when the API key is missing (in which case the call is omitted and the transition to `'map'` happens immediately).

INV-03: The story passed to `onSubmit` is `.trim()`-ed before leaving `StoryInput`. The raw textarea value is never used.

INV-04: The "Start Adventure" button is disabled (`disabled={!story.trim()}`) when the textarea is empty or whitespace-only.

INV-05: `StoryInput` enforces 500 characters via both `maxLength` on the textarea (hard browser limit) and `validateStoryInput` in the API layer (throws before the API call).

INV-06: The "Give me ideas" button is hidden when `onGetIdeas` is `undefined` (no API key set). It is never shown in a broken state.

INV-07: `generateStoryIdeas` contains no user-provided content in the `user` message — the call is fixed text and requires no prompt injection protection.
