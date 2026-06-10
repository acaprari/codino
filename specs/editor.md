# Editor

The editor capability covers the code-editing experience inside the workspace main area: CodeMirror integration, syntax highlighting, execution line highlighting, autocomplete, and inline error feedback.

## Decisions

### CodeMirror 6 with a Lezer grammar
The editor uses CodeMirror 6 (`src/features/editor/CodeEditor.tsx`) with the Lezer-generated Codino parser (`src/core/language/parser.ts`). One parser drives both execution and syntax highlighting — no duplicate token logic.

### External `code`-prop changes sync via dispatch, not remount
The `CodeEditor` instance is mount-stable (INV-01), so externally-driven `code`-prop changes — the most common being `setCode('')` on level transition — cannot reach the view by recreating it. Instead, an effect compares `viewRef.current.state.doc.toString()` to the incoming `code` prop and dispatches a `changes` replacement when they differ. The comparison guards against the echo loop: a user keystroke fires `onChange` → store → re-rendered `code` prop equal to what the view already holds, which would otherwise dispatch a no-op write on every character.

### EditorPane wraps CodeEditor with inline error slots
`src/features/aurora/workspace/EditorPane.tsx` composes:
- The `Label` component ("Editor")
- `CodeEditor` itself
- Optional `ParseErrorCard` shown when `parseErrors.length > 0`
- Optional `RuntimeErrorCard` shown when `runtimeError` is non-null

Only the first parse error is shown; further errors are typically cascaded from the first and would confuse a young player.

### Read-only during execution
While mode is `'executing'` or `'awaiting-rating'`, the editor receives `readOnly=true`. CodeMirror disables typing; line highlighting still works.

### Line highlighting via StateEffect
The current execution step's line number is dispatched as a `setHighlightedLine` StateEffect. A StateField applies a `Decoration.line` with an amber glow class. Dispatching `null` clears it.

### Autocomplete for keywords
`@codemirror/autocomplete` registers a completion source that triggers after 2 uppercase characters. Both Italian and English keywords are offered; prefix matching naturally separates them.

### Syntax highlighting from styleTags
`grammar.ts` attaches Lezer style tags to grammar nodes mapping to the Aurora accent palette via `--aurora-code-*` tokens: keywords → blue (`#93c5fd`), numbers → amber, strings → success green, identifiers → pink, operators → muted.

## Invariants

INV-01: The CodeEditor instance is created once per mount and never remounted in response to prop changes. External `code`-prop changes are applied via dispatch into the existing view, not by recreating it.

INV-02: Syntax highlighting derives from the Lezer grammar via styleTags. There is no separate highlighting regex or second tokenizer.

INV-03: Read-only mode (`readOnly=true`) suppresses both editing and the `onChange` callback.

INV-04: Error cards appear below the editor; they do not change the editor's height.

INV-05: Only the first parse error is shown in the UI. The complete error list is still returned by `parseWithErrors`.

INV-06: The interpreter (`interpreter.ts`) emits error messages in English only. Translation to Italian is the responsibility of `RuntimeErrorCard`, which maintains a `translateMessage()` map covering all known message strings. Unknown messages fall through unchanged.

INV-07: The prop-sync effect is a no-op when the view's document already matches the `code` prop, so user keystrokes that round-trip through the store do not race their own echo.
