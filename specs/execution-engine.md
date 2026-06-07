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
`AuroraApp` holds a `Mode` enum (`'idle' | 'executing' | 'awaiting-rating' | 'celebrating' | 'wrong-output' | 'gen-error' | 'game-complete'`). The right panel's visual mode is derived: `'execution'` only when `mode === 'executing'`; otherwise `'help'`.

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

## Invariants

INV-01: `execute()` is never called when `parseWithErrors` returned errors.

INV-02: The right panel is in `'execution'` mode if and only if `mode === 'executing'`.

INV-03: `rateCode` and `analyzeError` receive the player's source code (`currentCode`), never the execution output.

INV-04: Output comparison trims both sides; no other normalization.

INV-05: A rateCode or analyzeError failure shows a fallback; the player never sees an empty or broken popup.

INV-06: Editor is read-only when `mode === 'executing'` or `mode === 'awaiting-rating'`.

INV-07: `currentLevel` is always ≥ 1. The store initializes to 1 (not 0) and `resetProgress` resets to 1. Any saved progress with `currentLevel < 1` is clamped to 1 on load via `Math.max(1, ...)`.

INV-08: No initial element pick is required before level 1. The first problem is generated with `chosenElements: []`. The first element choice happens after completing level 1 via BranchSuccessPopup.
