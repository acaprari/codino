# Execution Engine

The execution engine orchestrates everything that happens between a player pressing "RUN" and seeing a success or error screen. It composes the language layer (parser + interpreter), the animation layer, output validation, and the AI calls that follow.

## Pipeline

```
Player presses RUN
  ↓
1. Parse + syntax check   parseWithErrors(code)
   → if errors: show child-friendly parse errors (stop here)
  ↓
2. Execute                execute(tree, code)
   → if RuntimeError: show child-friendly runtime error (stop here)
  ↓
3. Animate                ExecutionAnimator steps through ExecutionResult.steps
                          500 ms per step; shows output and variable snapshots
  ↓
4. Validate output        actual.trim() === expected.trim()  (exact string match)
   → if mismatch: call analyzeError → show AI explanation + expected vs actual
  ↓
5. Rate code              call rateCode → show SuccessScreen with stars +
                          explanation + narrativeBridge
```

## Decisions

### Parse errors stop execution; child-friendly messages come from `getParseErrors`
Before `execute()` is called, `parseWithErrors()` is called and its `errors` array is checked. If any errors exist, execution does not start and the UI displays the structured `ParseError` data as child-friendly messages. The language layer does not produce message strings — translation to child-friendly text is the UI's responsibility. (See `codino-language.md` for `ParseError` types.)

### Output validation is exact string match after whitespace trimming
`actualOutput.trim() === expectedOutput.trim()`. No numeric tolerance, no case folding. The expected output is whatever Claude generated in `generateProblem`; both sides are trimmed so trailing newlines from `SCRIVI` output do not cause false negatives.

### Wrong-output errors use `analyzeError` (Haiku) for the explanation
When output does not match, `analyzeError` is called with the problem description, the player's code, the expected output, and the actual output. The AI returns a child-friendly explanation. The hardcoded "Your output doesn't match" fallback is used only when the AI call fails. The expected-vs-actual values are always shown alongside the explanation regardless.

### Source code is passed to both `rateCode` and `analyzeError`, not the program output
`rateCode` and `analyzeError` receive the player's Codino source code (what they typed), not the execution output. Using the output would give Claude the correct answer to evaluate, not the code that produced it.

### `rateCode` is called with all required context
`StarRatingRequest` requires `story`, `problem`, `code`, `level`, `chosenElement`, and `language`. All are available in the store at the time `rateCode` is called. The current code from the store (`currentCode`) is used — it is synchronously updated by `setCode` before `handleRunCode` is called.

### Animation runs at 500 ms per step
Each `ExecutionStep` is displayed for 500 ms before advancing. The `OutputPanel` accumulates output lines incrementally; the `VariablesPanel` shows the variable snapshot at each step. A progress bar shows `currentStep / totalSteps`.

### Line highlighting during animation uses a CodeMirror decoration
During execution the 'executing' screen shows the code editor in read-only mode. As each `ExecutionStep` is processed, the `ExecutionAnimator` sets `highlightedLine` from `step.line` and passes it to `CodeEditor` as a prop. `CodeEditor` dispatches a `setHighlightedLine` `StateEffect` whenever the prop changes; a `StateField` converts that into a `Decoration.line` with the `.cm-executionLine` CSS class (amber glow, `rgba(234, 179, 8, 0.3)`). When animation completes the highlight is cleared by dispatching `null`.

The highlight field and theme live in `src/core/codemirror/lineHighlight.ts` and are included in every `EditorState` via `createEditorState`. The effect is only dispatched in response to prop changes — there is no polling.

### "Need Help?" calls `generateHint` (Sonnet)
The hint button in `EditorView` calls `generateHint` with the current problem and the player's current code. The returned hint is shown in a dismissable panel below the editor. If no API client is available (no key set), the button is disabled.

### `setCode` is called on every editor keystroke to enable debounced persistence
`EditorView.onChange` calls both local React state and the store's `setCode`. The store's `setCode` triggers the 2-second debounced write to `codino_current_level`. Without this, the debounced save built into the store is never triggered during editing. (See `game-state.md` for the persistence contract.)

### `rateCode` failure falls back to 3 stars
If the AI rating call fails (network error, rate limit, etc.), the level is completed with 3 stars and placeholder copy ("Great job!" / "Your adventure continues…"). This ensures a network error never blocks a child who solved the problem.

## Invariants

INV-01: `execute()` is never called on a program that has `ParseError` entries from `getParseErrors`. Syntax errors are caught and displayed before execution begins.

INV-02: `rateCode` receives the player's source code, not the execution output.

INV-03: `analyzeError` is called — not a hardcoded message — when actual output does not match expected output and an API client is available.

INV-04: Output comparison trims both sides: `actual.trim() === expected.trim()`.

INV-05: `rateCode` is always called with `story`, `problem`, `code`, `level`, `chosenElement`, and `language`. None may be omitted.

INV-06: A `rateCode` or `analyzeError` failure never leaves the player on a blank or broken screen. A safe fallback (3 stars / hardcoded copy) is always shown.
