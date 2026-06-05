# Editor

The editor capability covers everything between the player seeing a problem and clicking RUN: the problem display, the CodeMirror code editor, syntax highlighting, the hint panel, and the wiring between the editor and the persistence and execution layers.

## Decisions

### CodeMirror 6 with a custom Lezer language extension
`CodeEditor` wraps a CodeMirror 6 `EditorView`. The Codino language is registered as an `LRLanguage` using the same Lezer parser that drives execution. This means syntax highlighting derives from the real grammar — there is no separate highlighting regex or second parser.

### Editor state is created once; `code` prop is initialisation-only
`createEditorState` is called inside a `useEffect([], [])`. After the first render the editor manages its own document state; subsequent `code` prop changes are ignored. This is the canonical CodeMirror React integration pattern: letting CodeMirror own its document avoids re-creating the editor on every keystroke. The consequence is that `code` must reflect the correct initial value at mount time — `EditorView` initialises `localCode` from `currentCode` in the store, which is restored from `codino_current_level` on load.

### Syntax highlighting: five tag categories
`grammar.ts` attaches Lezer `styleTags` to all grammar nodes:

| Grammar nodes | Lezer tag | Colour |
|---|---|---|
| `SCRIVI WRITE RIPETI REPEAT VOLTE TIMES FINE END SE IF ALTRIMENTI ELSE` | `tags.keyword` | Blue `#3b82f6`, bold |
| `Number` | `tags.number` | Amber `#f59e0b` |
| `String` | `tags.string` | Green `#10b981` |
| `Identifier` | `tags.variableName` | Pink `#ec4899` |
| `Plus Minus Times XMul Divide Greater Less Equal` | `tags.operator` | Indigo `#6366f1` |

`syntaxHighlighting(codinoHighlightStyle)` in `codinoTheme` maps these tags to CSS colours. The language extension is the first item in the extensions list so the parser runs before any other extension reads syntax nodes.

### Dark editor body; lighter gutter for line-number readability
`codinoTheme` sets the editor body background to `#1e293b` (dark slate). A separate `EditorView.theme` in `createEditorState` overrides the gutter to `#f3f4f6` (light gray). Because the custom theme is added after `codinoTheme` in the extensions array it wins for the gutter property. The visual result — dark code area, lighter line-number strip — matches common professional editors and is more readable for children than an all-dark gutter.

### Font size 18 px; min content height 300 px
`createEditorState` enforces `fontSize: '18px'` and `minHeight: '300px'` via a base theme. These are the child-friendly size requirements from the design.

### `readOnly` mode for execution view
`createEditorState` accepts a `readOnly` boolean. When true, `EditorView.editable.of(false)` and `EditorState.readOnly.of(true)` are appended. The cursor disappears and keypresses are rejected. The `onChange` callback is also suppressed in the `updateListener`. This mode is used by `ExecutionAnimator` to show the code with line highlighting during animation.

### Execution line highlighting via `StateEffect` + `StateField`
`lineHighlightField` is included in every editor state. When `CodeEditor` receives a `highlightedLine` prop change, it dispatches `setHighlightedLine` to the CodeMirror view. The `StateField` converts this into a `Decoration.line` with class `.cm-executionLine` (amber glow, `rgba(234, 179, 8, 0.3)`). Dispatching `null` clears the highlight. This applies in both editable and read-only editors.

### `onChange` → `setLocalCode` + `setCode` on every keystroke
`EditorView.handleCodeChange` calls both the local React state setter and the store's `setCode`. The store action triggers the 2-second debounced write to `codino_current_level`. `handleRun` additionally calls `setCode(localCode)` synchronously before invoking `onRun`, so the store always holds the latest code before execution begins.

### Hint panel displayed inline below the editor
When `hint` is defined, a yellow left-bordered panel appears between the editor and the button row. The "Need Help?" button is disabled and shows "⏳ Getting hint…" while `helpLoading` is true.

### Keyword autocomplete triggers after 2 uppercase characters
`codinoAutocomplete` (from `src/core/codemirror/autocomplete.ts`) registers a single completion source via `autocompletion({ override: [codinoCompletionSource] })`. The source fires when the cursor is at the end of a sequence of 2+ uppercase ASCII letters (`/[A-Z]+/`). It returns all keywords that start with the typed prefix. Explicit invocation (Ctrl+Space) fires after just 1 character.

Both Italian and English keywords are offered in every completion list. No language filtering is needed: prefix matching provides natural separation — typing `SCR` surfaces only Italian keywords (`SCRIVI`), typing `WR` surfaces only English ones (`WRITE`). `defaultKeymap: true` includes CodeMirror's default completion keybindings (Tab/Enter to accept, Escape to dismiss).

The source never fires for lowercase sequences, so variable names typed in lowercase never trigger the dropdown. It is included in read-only editor state but has no effect because no typing occurs.

### Inline error markers (squiggly underlines) are not implemented
Parse errors are shown in the `ErrorDisplay` component below the editor after the player clicks RUN. The editor does not show squiggly underlines in real time. The design document does not explicitly require inline markers; the error panel is the specified feedback mechanism.

## Invariants

INV-01: The CodeMirror `EditorView` instance is created once per `CodeEditor` mount and destroyed on unmount. It is never re-created in response to prop changes.

INV-02: `createEditorState` always includes `codinoLanguageSupport()` as the first extension and `codinoAutocomplete` as the second, so syntax tokens are available to all subsequent extensions and completion fires in both editable and read-only states.

INV-03: `readOnly=true` suppresses both editing (`EditorView.editable.of(false)`) and the `onChange` callback. Read-only editors never call their `onChange`.

INV-04: Every `EditorState` created by `createEditorState` includes `lineHighlightField` and `executionLineTheme`. Line highlighting is always available; dispatching `setHighlightedLine.of(null)` clears it.

INV-05: `EditorView.handleRun` calls `setCode(localCode)` before `onRun(localCode)`, guaranteeing the store's `currentCode` matches the code being executed.
