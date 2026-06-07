# Execution Engine

The execution engine orchestrates parsing, execution, validation, and the in-workspace state transitions between the editor and the right-panel modes.

## Pipeline

```
Player presses RUN
  ↓
1. Parse + syntax check     parseWithErrors(code)
   → if errors: show ParseErrorCard inline; mode stays 'idle'
  ↓
2. Execute                  execute(tree, code)
   → if RuntimeError: show RuntimeErrorCard inline; mode stays 'idle'
  ↓
3. Animate                  mode → 'executing'; right panel crossfades to ExecutionPanel
                            Each ExecutionStep displayed for 1500 ms (STEP_DURATION_MS)
                            Editor frozen (readOnly), current line highlighted amber
                            Output and variables update incrementally in the panel
  ↓
4. Validate                 actual.trim() === expected.trim()
   → mismatch: call analyzeError (Claude Haiku) → WrongOutputModal
   → match:    call rateCode (Claude Sonnet)    → BranchSuccessPopup
```

## Decisions

### Level 1 problem generated automatically after map
`generateProblem` is called for level 1 (with empty `chosenElements`) immediately after `generateMap` completes during story submission. The map is not interactive — the player never clicks a node to start. Subsequent problems are generated in `handleBranchPick` after the player picks a branch.

### Mode state machine drives the workspace
`AuroraApp` holds a `Mode` enum (`'idle' | 'executing' | 'awaiting-rating' | 'celebrating' | 'wrong-output' | 'gen-error' | 'game-complete'`). The right panel shows `'execution'` mode for every state except `idle`, `gen-error`, and `game-complete` — i.e. the output stays visible from when RUN is pressed until the player takes an explicit action (Try Again → `idle`, or branch pick → `idle`). This gives the player time to read the output before the panel reverts to Help.

### Animation pace
Each execution step is displayed for 1500 ms via the module-level constant `STEP_DURATION_MS`.

### Validation is exact string match after trim
`actualOutput.trim() === expectedOutput.trim()`. No numeric tolerance, no case folding.

### Wrong output uses Claude Haiku
`analyzeError` runs Claude Haiku for cost-efficient explanation. Failure falls back to a generic bilingual message.

### Successful runs trigger rateCode
`rateCode` is called with story, problem, source code, level, chosen element, language. Returns stars (1–3), explanation, and narrative bridge for the BranchSuccessPopup.

### rateCode failure falls back to 3 stars
A network error never blocks a child who solved the problem.

### Game completion: `'game-complete'` mode and `GameCompleteModal`
After `completeLevel` runs on level 10, `AuroraApp` sets `mode` to `'game-complete'` instead of `'celebrating'`. This is the only path into `'game-complete'` — it is never reachable from a partial run, an error, or `idle`. The branch decision lives in three sibling lines in `handleRun`: `setMode(currentLevel >= 10 ? 'game-complete' : 'celebrating')`, covering the rateCode-success, rateCode-failure-fallback, and no-API-key-fallback paths so all three correctly terminate the game.

`GameCompleteModal` is open whenever `mode === 'game-complete'`. It displays `totalStars = Object.values(stars).reduce((a, b) => a + b, 0)` (across all 10 levels, max 30) and offers two actions:
- **Close** (ghost) — dismisses the modal but leaves progress intact. Player remains on the level-10 workspace.
- **New adventure** (primary) — calls `handleRestart`, which runs `resetProgress`, clears the rating, sets mode back to `'idle'`, and reopens the WelcomeStoryModal.

The modal is `dismissible={true}` (close ✕, Escape, backdrop click all work) because there is no required action — closing simply leaves the player on a completed game.

## Invariants

INV-01: `execute()` is never called when `parseWithErrors` returned errors.

INV-02: The right panel is in `'execution'` mode whenever `mode` is not `'idle'`, `'gen-error'`, or `'game-complete'` — i.e. for `'executing'`, `'awaiting-rating'`, `'celebrating'`, and `'wrong-output'`. This keeps the output visible from RUN press until the player takes an explicit action (Try Again or pick a branch).

INV-03: `rateCode` and `analyzeError` receive the player's source code (`currentCode`), never the execution output.

INV-04: Output comparison trims both sides; no other normalization.

INV-05: A rateCode or analyzeError failure shows a fallback; the player never sees an empty or broken popup.

INV-06: Editor is read-only when `mode === 'executing'` or `mode === 'awaiting-rating'`.

INV-07: `currentLevel` is always ≥ 1. The store initializes to 1 (not 0) and `resetProgress` resets to 1. Any saved progress with `currentLevel < 1` is clamped to 1 on load via `Math.max(1, ...)`.

INV-08: No initial element pick is required before level 1. The first problem is generated with `chosenElements: []`. The first element choice happens after completing level 1 via BranchSuccessPopup.

INV-09: Variable values in `ExecutionPanel` are displayed with type-aware formatting: strings are wrapped in double quotes and coloured green (`--aurora-accent-success`); numbers are coloured amber (`--aurora-accent-amber`). This prevents string values from being visually confused with variable names.

INV-10: `HelpPanel` auto-expands the category matching the current level's concept on mount, aligned with `LEVEL_CONCEPTS` in `claude.ts` (1-based): level 1 = Writing, levels 2–3 = Math, levels 4–5 = Loops, levels 6+ = Conditions. The player can manually toggle any category.

INV-11: `GameCompleteModal.open === (mode === 'game-complete')`. The modal is open if and only if the mode is `'game-complete'`.

INV-12: `'game-complete'` mode is reachable only from `completeLevel(10, ...)` — specifically, the three branches in `handleRun` that fire after a successful output match on level 10 (rateCode success, rateCode failure fallback, no-API-key fallback). It is never set from `idle`, `gen-error`, `wrong-output`, or a partially-completed run.
