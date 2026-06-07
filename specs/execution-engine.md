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
