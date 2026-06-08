# Codino Language

The Codino language is a bilingual (Italian/English) mini-language designed for 7–8 year olds. It teaches variables, arithmetic, loops, and conditionals through a syntax that resembles BASIC: no colons, no `var` keywords, minimal punctuation. Both language variants are handled in a single Lezer grammar, so the parser accepts either language at all times.

## Decisions

### Single grammar for both languages
Both Italian and English keywords are defined in one Lezer grammar using `@specialize`. Either keyword variant is accepted anywhere in a program — there is no per-language grammar switch. This avoids maintaining two grammars in sync and allows mixing languages without parser failure.

### `=` is used for both assignment and equality comparison
A single `=` token serves two purposes, disambiguated by parser context:
- At statement level after an identifier: assignment (`mele = 5`)
- Inside a condition after `SE`/`IF`: equality check (`SE draghi = 10`)

This simplification avoids teaching 7–8 year olds the `==` vs `=` distinction that confuses beginners in conventional languages. The LR parser's state machine distinguishes the two uses without any ambiguity.

### `x` (lowercase) is the multiplication operator alias and is a reserved word
The letter `x` alone cannot be used as a variable name. Variable names that start with `x` followed by other characters (e.g., `xa`, `x2`) are valid identifiers. The grammar uses `@specialize` to map the complete identifier token `"x"` to a separate AST node `XMul`, leaving multi-character identifiers untouched. `XMul` is treated identically to `Times` (`*`) by the interpreter.
> Alternatives considered: using `@precedence { Times, Identifier }` with `Times { "*" | "x" }` was tried first, but Lezer's `@precedence` overrides longest-match entirely, which would make `xa` tokenize as `Times("x") + Identifier("a")` — breaking any variable name starting with `x`. `@specialize` is correct because it only fires on the exact isolated identifier `"x"`, not on longer tokens.
> Alternatives considered: uppercase `X` was an earlier implementation choice, but lowercase `x` matches the convention used when teaching children multiplication on paper.

### Operator precedence: multiplication and division before addition and subtraction
The interpreter applies a two-pass evaluation: `*` and `/` are resolved first, then `+` and `-`. The grammar encodes this via `@precedence { mul, add }`. Parentheses override precedence in the standard way.
> Alternatives considered: left-to-right evaluation (no precedence) was rejected because it would teach incorrect math.

### Decimal numbers are supported in expressions but not as loop counts
The grammar allows `Number { $[0-9]+ ("." $[0-9]+)? }`, so decimals parse anywhere. The interpreter explicitly validates that the loop count is a non-negative integer and throws a `RuntimeError` if it is fractional or negative.

### Loop count is capped at 1000 iterations
The interpreter throws a `RuntimeError` if the loop count exceeds 1000. Even though the grammar requires a literal integer (bounding the value to what a child can type), very large numbers (e.g., `RIPETI 9999 VOLTE`) could lock up the browser. The 1000-iteration cap prevents this.

### Arithmetic on string values is a runtime error
Variables hold either a `number` or a `string`. Using a string-valued variable in arithmetic (e.g., `"hello" + 5`) throws a `RuntimeError`. This is shown to the player as a child-friendly message. Implicit coercion to `NaN` is not acceptable because it produces silent wrong answers.

### Variable types: numbers and strings only
Variables hold either a JavaScript `number` (including decimals) or a `string` (contents between quotes). There is no boolean type — condition results are used internally by the interpreter and never stored in variables or printed.

### Flat variable scope — no nesting, no shadowing
All variables live in a single `Environment` (a `Map<string, number | string>`). There are no functions, no block scopes, and no scoping rules to teach. A variable set inside a loop body is visible outside it.

### The language layer produces structured `ParseError` objects; presentation is a separate concern
When parsing fails, the language layer walks the AST for error nodes (`⚠`) and classifies each error by type (keyword typo, missing block terminator, generic syntax error). It returns `ParseError[]` with type, line, found text, and suggested correction — but no message strings. The UI layer is responsible for converting `ParseError` objects into bilingual, emoji-annotated child-friendly strings. This separation means the language layer has no knowledge of the current language (Italian/English) or visual style.

### Execution produces a step trace for animation
Every statement execution appends an `ExecutionStep` to the trace. Each step captures the current line number, a snapshot of all variables, and any output produced. The animation layer consumes this trace — it is not generated lazily.

### Errors are returned, not thrown, at the top level
`execute()` catches all `RuntimeError` instances and returns `{ steps, output, error }`. Callers do not need try/catch. Errors during a partially-executed program include the steps and output accumulated before the error.

### One Lezer grammar, two consumers
The Codino grammar (`src/core/language/codino.grammar`) is compiled to `src/core/language/parser.ts` and consumed in two places:

- `interpreter.ts` parses source via the Lezer parser and walks the resulting tree to execute the program.
- `grammar.ts` wraps the same parser in `LRLanguage.define({ parser: parser.configure({ props: [styleTags({...})] }) })` and exposes it as `codinoLanguageSupport()` for CodeMirror. Style tags map keywords, numbers, strings, identifiers, and operators to the `@lezer/highlight` tag namespace.

There is no separate highlighting tokenizer or per-language grammar. Both Italian and English keywords live in the single grammar via `@specialize` and are tagged identically.

### Multi-argument `SCRIVI`/`WRITE`
`Print` accepts one or more comma-separated expressions: `WRITE "Animals:", apples`. Segments are evaluated independently, `String()`-coerced, and joined with a single space. This was added to close the gap where AI-generated problems expect a string and a variable on the same line (e.g. "Animals: 5") — previously the language had no way to combine them.
> Alternatives considered: relaxing INV-10 to allow string `+` concatenation was rejected because it overloads `+` (add vs. join), contradicting the spec's deliberate strictness around string operands.

### Loop count is any expression, not just a literal
`Loop` accepts any `expression` in the count position, not only a `Number` token. The 1000-iteration cap and non-negative integer validation still apply at runtime. This enables natural problem phrasings like `monsters = 5; REPEAT monsters TIMES`.

### Iteration-variable loop: `REPEAT i FROM a TO b … END`
A second loop form binds an identifier as a counter, inclusive of both bounds, and incremented by 1 per iteration. Italian equivalent: `RIPETI i DA a A b … FINE`. The variable lives in the single flat scope per INV-06 and remains visible after the loop with value `b`. `from > to` throws `RuntimeError`; `(to - from + 1) > 1000` throws `RuntimeError`. The two loop forms are named `CountLoop` and `RangeLoop` in the grammar; there is no wrapper `Loop` node — both forms are direct alternatives in the `statement` rule.

### Named parity in conditions: `EVEN`/`PARI`, `ODD`/`DISPARI`
Conditions accept a postfix parity form alongside comparisons: `IF apples EVEN`, `SE mele DISPARI`. Implemented as four uppercase keywords (case-sensitive — lowercase `even`/`odd`/`pari`/`dispari` remain valid identifiers). Non-integer numbers and string operands throw `RuntimeError`. This was chosen over adding a `REMAINDER`/`%` operator because parity is a named property at the 7–8 curriculum level, not a derived computation.

## Invariants

INV-01: A valid Codino program consists only of `Assignment`, `Print`, `Loop`, and `Conditional` statements at the top level.

INV-02: `SCRIVI`/`WRITE`, `RIPETI`/`REPEAT`, `VOLTE`/`TIMES`, `SE`/`IF`, `ALTRIMENTI`/`ELSE`, `FINE`/`END`, `PARI`/`EVEN`, `DISPARI`/`ODD`, `DA`/`FROM`, `A`/`TO` are reserved keywords and cannot be used as variable names. All keywords are uppercase; the lowercase spelling of any keyword (e.g. `a`, `even`, `from`) remains a valid identifier.

INV-03: Lowercase `x` alone is the multiplication operator alias (`XMul`); it cannot be used as a variable name. Variable names beginning with `x` followed by at least one other character (e.g., `xa`, `x2`) are valid identifiers.

INV-04: Loop count must produce a non-negative integer no greater than 1000 at runtime, whether sourced from a `CountLoop` count expression or a `RangeLoop` `(to - from + 1)` span. A non-integer, negative, or over-cap value throws `RuntimeError`. For `RangeLoop`, `from > to` also throws `RuntimeError`.

INV-05: Equality comparison in conditions uses a single `=`. Inside a `SE`/`IF` condition, `=` is the comparison operator; at statement level after an identifier, `=` is assignment. The parser disambiguates by state.

INV-06: All variables share a single flat scope. A variable assigned inside a loop body is visible after the loop ends.

INV-07: `execute()` never throws — it always returns an `ExecutionResult` where `error` is set on failure.

INV-08: Each statement that successfully executes appends exactly one `ExecutionStep` to the trace, except loops which append one step per iteration per inner statement.

INV-09: String output from `SCRIVI`/`WRITE` is the `String()` coercion of the evaluated expression — numbers print without trailing `.0`.

INV-10: Using a string value as an operand in an arithmetic operation (`+`, `-`, `x`/`*`, `/`, `:`) or a parity check (`EVEN`/`PARI`/`ODD`/`DISPARI`) throws a `RuntimeError`. String values may only be used with `SCRIVI`/`WRITE`.

INV-11: `getParseErrors()` returns a `ParseError[]` — structured, message-free error data. The array is empty when the program has no parse errors.

INV-12: Parity checks (`EVEN`/`PARI`/`ODD`/`DISPARI`) require an integer operand; non-integer numbers and string values throw `RuntimeError`.

INV-13: A `RangeLoop`'s iteration variable lives in the single flat scope; its final value (= `to`) remains visible after the loop ends. A pre-existing variable with the same name is overwritten.

INV-14: A `Print` statement may carry one or more arguments separated by `Comma` tokens. Each segment is evaluated independently, `String()`-coerced, and joined with a single space before being appended to the output array as a single line.
