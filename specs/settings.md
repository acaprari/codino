# Settings

The settings screen is the player's control panel: API key management, language preference, and progress reset. It is reached via the gear icon in the navbar and is available from any screen. All state is read from and written to the Zustand store directly; this screen owns no persistent state of its own.

## Decisions

### Three sections, in this order: API Key, Language, Clear Progress
The order reflects player priority. API key is the prerequisite for any AI interaction and is shown first. Language is the next-most-likely change. Clear Progress is destructive and placed last to require deliberate intent.

### All UI text is bilingual; both languages live in component-local maps
Like `WelcomeScreen` and `StoryInput`, `SettingsView` and `ApiKeyInput` carry their own `{ it: {...}, en: {...} }` text maps and read `language` from the store. This matches the design's "Everything switches together" principle — switching the language toggle updates all settings labels immediately, alongside the rest of the app. No translation library is used.

### API key is validated by a minimal real API call before saving
`ClaudeAPIClient.testConnection()` sends a 1-token "Hi" message with `max_tokens: 10`. This is the cheapest possible round trip that proves the key works. The key is saved to the store (and thus to localStorage) **only if the test succeeds**. An invalid key is never persisted.
> Alternatives considered: client-side regex validation of the `sk-ant-` prefix was rejected because a well-formed but revoked or wrong-account key would still pass — a real round trip is the only authoritative check.

### Test result is visible inline; success auto-saves
After the player clicks "Test & Save", three states are possible:
- **Testing** — button disabled, label changes to "Testing…"
- **Success** — green banner "API key is valid and saved!", key persisted to store
- **Error** — red banner "This API key doesn't work. Please check it and try again.", key is **not** persisted

The success and error banners persist until the player edits the field again or closes the settings screen.

### API key field is password-masked
`<input type="password">` hides the key visually. The browser will not autofill it from password managers (no `name` attribute on the form). The masked field shows the currently saved key (if any), giving the player a way to verify a key is set without revealing it.

### Warning text is always shown next to the API key field
The yellow warning panel — "Your API key stays in your browser and is never sent anywhere except to Anthropic. Never share your API key with anyone." — is part of the layout, not a tooltip. Children should see this every time they interact with the field, not only on first use.

### A link to the Anthropic console accompanies the field
"Get an API key from Anthropic →" links to `https://console.anthropic.com/settings/keys` in a new tab with `rel="noopener noreferrer"`. This is the single source-of-truth pointer for players who do not have a key yet.

### Language toggle: two equal-weight buttons with flag + label
Italian and English are shown as two equal-sized buttons with a flag icon and language name. The currently selected language has a purple border and tinted background. Clicking either button calls `setLanguage` and updates the entire app instantly. The same toggle also exists in the navbar — both routes are equivalent.

### Clear Progress uses a custom in-app confirmation modal (not `window.confirm`)
A native browser `confirm()` dialog is not used. It cannot be styled, cannot be made bilingual at runtime, and breaks the visual continuity of the app for a 7–8 year old. Instead, a custom modal overlay confirms the action with bilingual buttons. Clicking "Confirm" calls `resetProgress()` (which preserves API key and language); clicking "Cancel" dismisses the modal with no state change.
> Alternatives considered: skipping the confirmation entirely was rejected because progress loss is irreversible and an accidental click on the warning-coloured button would be devastating to a child mid-game.

### Clear Progress preserves API key and language
The text adjacent to the "Clear All Progress" button states: "This will delete your story and all progress. Your API key will be kept." This is the contract guaranteed by `resetProgress()` in the store (see [[game-state]] INV-07).

### Settings is reachable from any screen
The gear icon in `Navbar` calls `onSettingsClick`, which routes through `App.tsx` to set the screen to `'settings'`. Closing returns to the previous logical screen: `'map'` if the player has a story, otherwise `'welcome'`.

## Invariants

INV-01: An API key is saved to the store only after `testConnection()` succeeds. A failed test never persists the key.

INV-02: All text shown in `SettingsView` and `ApiKeyInput` derives from the language map of the active language. No hardcoded English-only strings appear.

INV-03: Clearing progress preserves `language` and `apiKey` in both the store and localStorage. See [[game-state]] INV-07.

INV-04: The Clear Progress action requires a confirmation step before `resetProgress()` is called.

INV-05: The API key field uses `type="password"`. It is never rendered in plaintext.

INV-06: The settings screen reads all its data from `useGameStore`. It maintains no local state for `language`, `apiKey`, or any progress field.
