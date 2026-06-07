# Settings

Settings is reached via the gear icon in the workspace top bar. It opens a SettingsModal (built on AuroraModal) with three sections: API Key, Language, Clear Progress.

## Decisions

### One AuroraModal with three sections
API Key → Language → Clear Progress. Order reflects player priority: missing API key blocks everything; language is the next-most-likely change; Clear Progress is destructive and goes last.

### Bilingual UI text via per-component language maps
Every label, button, warning, and confirmation string has `it` and `en` variants in a local map in SettingsModal.tsx. No translation library.

### Real API call to validate the key
`ClaudeAPIClient.testConnection()` sends a minimal test request. The key is persisted to `useGameStore` only if the call succeeds. Network or auth errors → red banner, no save.

### Test result auto-clears on edit
If the player edits the API key field after a success or error banner appears, the banner clears immediately.

### Clear Progress requires a confirmation modal
A nested AuroraModal asks for confirmation. Confirming calls `resetProgress` (preserves language + API key); cancelling dismisses the confirmation only.

### Dismissible
Settings modal is `dismissible={true}`: ✕ button top-right, Escape key, backdrop click all close. The confirmation sub-modal is also dismissible.

### Close button uses bilingual aria-label
`aria-label={t.close}` — `'Close'` or `'Chiudi'`.

## Invariants

INV-01: An API key is persisted only after `testConnection` succeeds.

INV-02: Every string rendered in SettingsModal comes from the language map; no hardcoded literals.

INV-03: Clear Progress requires the confirmation sub-modal. `resetProgress` is never called directly from the primary modal.

INV-04: The API key input has `type="password"`. Never rendered in plaintext.

INV-05: All state read from `useGameStore`; no local copies of API key or language except the unvalidated `key` input buffer.
