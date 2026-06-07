# Codino Language Revision — Design

**Date:** 2026-06-07
**Scope:** Targeted revision of the Codino language and AI problem-generation pipeline to close five observed gaps for the 7–8 year old curriculum.

## Background

Five gaps surfaced while playing the current game:

1. AI-generated problems frequently expect a string and a variable on the same line (e.g. `Animals: 5`), but the language has no way to combine them in one `WRITE`.
2. AI-generated problems sometimes require even/odd checks, but the language has no modulo operator.
3. The AI's evaluation text occasionally references Python, because the model pattern-matches Codino code (which resembles Python superficially) to Python.
4. Some constructs that would meaningfully expand the 7–8 curriculum are missing.
5. The grammar restricts loop counts to literal integers, which blocks the natural "loop the number of times equal to a variable" phrasing.

Additionally, while testing it became clear that comparison operators (`<`, `>`, `=`) get little airtime even at the levels where they're nominally taught. The AI's problem-generation prompt allows them but never requires them, and the model's natural pull toward arithmetic — combined with the `=` assignment/comparison dual meaning compounding the Python-confusion — meant condition problems often skipped comparisons entirely.

This design addresses all six in one pass.

## Goals and non-goals

**Goals:**

- Extend the grammar with the minimum constructs needed to close the gaps.
- Make the AI consistently identify the language correctly in evaluation output.
- Make condition coverage in the curriculum prescriptive, not permissive.
- Keep every change inside the deliberate constraints of the existing language (no `==`, no functions, no arrays, no `AND`/`OR`).

**Non-goals (deferred to a future age tier):**

- `AND` / `OR` in conditions.
- Single-line comments.
- Unary minus / negative number literals.
- `REMAINDER` / modulo operator.
- `WHILE` loops, functions, arrays, input.

The deferred items are not bad — they're age-tiered. They fit a 9–10 or 11–13 age bracket better than 7–8 and would land in a future expansion of the per-age curriculum.

## Decisions

### D1 — Multi-argument `WRITE` with comma separator and space join

`WRITE "Animals:", apples` prints `Animals: 5` on one line. Comma separates arguments; arguments are joined with a single space. This mirrors Python's `print()` behaviour and reads aloud naturally for the age group.

**Alternatives considered:**

- Whitespace-separated args (`WRITE "Animals:" apples`) — rejected because the grammar becomes ambiguous-looking and harder to teach ("why are there gaps?").
- Comma-separated, no-glue join (`WRITE "Animals: ", apples`) — rejected because trailing-space-in-string formatting is fiddly at this age.
- String concatenation in `+` — rejected because it overloads `+` (add numbers vs. join strings), contradicting the spec's deliberate strictness around string operands.
- Constrain the AI to never combine string+number — rejected because it permanently rules out the most natural problem phrasing.

### D2 — Named parity in conditions: `PARI`/`EVEN`, `DISPARI`/`ODD`

`SE mele PARI` / `IF apples EVEN` and the `DISPARI`/`ODD` counterparts. Postfix form inside conditions only.

**Alternatives considered:**

- `RESTO`/`REMAINDER` infix operator — rejected because "remainder after dividing" is abstract for 7–8 y.o.; named parity covers the actual problem the AI keeps generating.
- Both keyword parity and remainder operator — rejected as doubled surface area for marginal benefit at this age.
- Constrain the AI to skip parity problems — rejected because parity is a real concept kids meet in school at this age.

### D3 — Shared Codino reference card in AI prompts

A single `CODINO_REFERENCE` constant in `src/core/api/prompts.ts` is injected into the system prompt of every call that examines the player's code: `buildProblemGenerationPrompt`, `buildStarRatingPrompt`, `buildHintPrompt`, `buildErrorAnalysisPrompt`. Calls that don't see code (`buildMapGenerationPrompt`, `buildStoryIdeasPrompt`) don't get it.

The card names the language, lists keywords and operators in both Italian and English, calls out that `=` is dual-purpose, lists what is *not* in the language (no `%`, no `AND`/`OR`, no functions/arrays/input), explains multi-arg print, and forbids referencing Python/JavaScript/etc. by name. It also instructs the AI not to generate problems whose answer depends on operator precedence — either one operator per expression, or intermediate variables.

**Alternatives considered:**

- Inline gating in each prompt without a shared constant — rejected because drift across prompts is inevitable as the language evolves.
- Reference card plus a one-shot example program — held in reserve; the constant alone is expected to be sufficient. Can be added later if model output proves unreliable.

### D4 — Loop iteration variable: `REPEAT i FROM a TO b … END`

Adds a second loop form: `RIPETI i DA a A b … FINE` / `REPEAT i FROM a TO b … END`. The variable `i` is bound for the duration of the loop body and counts from `a` up to and including `b`. After the loop ends, `i` remains visible in the flat scope with value `b` (consistent with INV-06 of `codino-language.md`).

Variables visible in the right-panel ExecutionPanel update step-by-step, so the player watches `i` increment in real time — which is the main pedagogical value of adding the construct.

**Alternatives considered:**

- Defer iteration variable to a 9–10 tier — rejected because it's the only addition that meaningfully unlocks new 7–8 problems (counting 1..N, summing 1..N), and the visible-counter behaviour is age-appropriate.
- `WHILE` loops — rejected as too abstract for the age and not unlocking enough new problems.

### D5 — Loop count is any expression, not just a literal

`RIPETI N VOLTE` / `REPEAT N TIMES` accepts any expression in the count position, not only an integer literal. The 1000-iteration `RuntimeError` cap and non-negative-integer validation still apply at execution time.

This also covers the bounds of the iteration-variable loop form: both `from` and `to` are expressions.

**Rationale:** the literal restriction added nothing to safety — the runtime cap protects regardless — but blocked the natural form `monsters = 5; REPEAT monsters TIMES`.

### D6 — Parentheses stay hidden

Parentheses are already in the grammar (`Term { … | "(" expression ")" }`) and stay there. They are not documented in `USER_GUIDE.md` or in the HelpPanel. The AI reference card does not list them. Instead, the AI is told to avoid generating problems whose answer depends on operator precedence.

**Alternatives considered:**

- Surface parens as a taught construct — rejected (for this design pass) to keep the surface area minimal at 7–8. A future age tier may surface them.
- Remove parens from the grammar — rejected because it removes existing capability without adding clarity, and is a (minor) breaking change.

### D7 — Per-level construct gating is prescriptive, not permissive

`LEVEL_CONCEPTS` (currently a string concept name per level) becomes a structured per-level definition that includes: (a) the level's taught concept, (b) the set of constructs allowed at that level (cumulative — all constructs from earlier levels remain available), and (c) the construct that the generated problem **must** exercise.

`buildProblemGenerationPrompt` consumes this structure and emits both an "allowed constructs" paragraph and a "this problem must use {required construct}" line in the system prompt.

The full per-level mapping is in the "Level curriculum" section below.

### D8 — Equality (`=`) in conditions is rotated into level 6 alongside `>` and `<`

Level 6's required construct is one of `IF <var> > <num>`, `IF <var> < <num>`, or `IF <var> = <num>`, with the AI picking which. The reference card includes a per-call diversity nudge: "avoid defaulting to `>`; pick whichever comparison operator best fits the narrative". The AI is stateless across level-generation calls, so this is a per-call instruction, not a cross-call coordination — but with three options across levels 6, 8, and 10 the per-call nudge is expected to produce reasonable variety in practice.

**Alternatives considered:**

- Guaranteed equality appearance at level 10 only — rejected because the user wanted equality drilled, not just surfaced.
- Don't drill equality at all — rejected for the same reason.
- Deterministic fixed operator per level — rejected because every kid would see the same operator first; the AI's choice with a diversity nudge gives variation across playthroughs without extra plumbing.
- Story-seeded operator choice — rejected as marginal value for extra complexity.

### D9 — Loop+condition combination splits parity and comparison across levels 8 and 9

Levels 8 and 9 both teach "Loops + Conditions" combined. Level 8's required construct is a comparison inside a `REPEAT … END`; level 9's is parity inside a `REPEAT … END`. This gives kids practice with each condition form individually before level 10's freeform.

### D10 — Level 7 introduces parity standalone (not combined with loops)

Parity gets its own dedicated condition level (7) before being combined with loops at level 9. This separates "learn parity" from "combine parity with loops" — two new concepts at once is harder than one at a time.

## Grammar

`src/core/language/codino.grammar`:

```
Print {
  (kw<"SCRIVI"> | kw<"WRITE">) expression ("," expression)*
}

Loop {
  (kw<"RIPETI"> | kw<"REPEAT">) expression (kw<"VOLTE"> | kw<"TIMES">)
    statement* (kw<"FINE"> | kw<"END">)
  |
  (kw<"RIPETI"> | kw<"REPEAT">) Identifier
    (kw<"DA"> | kw<"FROM">) expression
    (kw<"A">  | kw<"TO">)   expression
    statement* (kw<"FINE"> | kw<"END">)
}

condition {
  expression (Greater | Less | Equal) expression |
  expression (kw<"PARI"> | kw<"EVEN"> | kw<"DISPARI"> | kw<"ODD">)
}
```

All new keywords use `@specialize` and are uppercase only (consistent with existing `WRITE`, `IF`, etc.). Lowercase identifiers with the same spelling (`a`, `to`, `from`, `even`, `da`, `pari`) remain valid variable names.

New reserved words: `PARI`, `EVEN`, `DISPARI`, `ODD`, `DA`, `FROM`, `A`, `TO`.

## Interpreter

`src/core/language/interpreter.ts`:

**Multi-arg `Print`** — walk each child expression, evaluate, `String()`-coerce, join with a single space. Output is one line per `Print` statement regardless of argument count. INV-09 (numbers print without trailing `.0`) stays valid because each part is still `String()`-coerced.

**Expression as loop count** — evaluate the count expression to a number; validate it's a non-negative integer ≤ 1000. Same `RuntimeError` as today, just sourced from any expression instead of a literal token.

**Iteration-variable loop** — evaluate `from` and `to` expressions, with validation:

- Both must be integers — `RuntimeError` if either is not.
- `to >= from` — if `to < from`, `RuntimeError` ("`FROM` must be at most `TO`"). Surfaces the mistake rather than silently iterating zero times.
- `(to - from + 1) <= 1000` — same cap as the existing loop, framed in iteration count.

The loop variable binds into the single flat scope per INV-06 — it's a normal variable, visible after the loop, holding the final value `to`. A pre-existing variable with the same name is overwritten.

**Parity in conditions** — when the condition node is the parity form:

- If the value is a string → `RuntimeError` (extends INV-10's spirit: parity is arithmetic).
- If the value is a non-integer number → `RuntimeError` ("`PARI`/`EVEN` works with whole numbers").
- Otherwise: `EVEN`/`PARI` → `value % 2 === 0`; `ODD`/`DISPARI` → `value % 2 !== 0`. Negatives behave as expected (`-4 EVEN` → true).

**ExecutionStep behaviour** — the iteration variable appears in the variables snapshot of every step inside the loop body. Each iteration of an inner statement produces one step per INV-08.

## AI prompt changes

`src/core/api/prompts.ts`:

### `CODINO_REFERENCE` constant

Built once at module load (per language) and injected into the system prompt of `buildProblemGenerationPrompt`, `buildStarRatingPrompt`, `buildHintPrompt`, `buildErrorAnalysisPrompt`. Contents (~200 tokens):

```
This is the Codino language. Do NOT reference Python, JavaScript, or any
other programming language by name in your output. Codino is its own
small language for 7-8 year old children.

Keywords (Italian | English):
  SCRIVI | WRITE          print one or more values, joined by spaces
  RIPETI N VOLTE … FINE   |  REPEAT N TIMES … END    fixed-count loop
  RIPETI i DA a A b … FINE | REPEAT i FROM a TO b … END  counted loop
  SE … (ALTRIMENTI …) FINE | IF … (ELSE …) END     conditional
  PARI | EVEN, DISPARI | ODD   parity check (postfix in condition)

Operators: + - x (or *) : (or /) for math; > < = for comparison.
A single = is both assignment (at statement level) and equality
(inside a condition). There is no %, no AND/OR, no functions, no
arrays, no input, no string manipulation. Strings can only be printed.

Multi-arg print: WRITE "score:", points → "score: 5" on one line.

DO NOT generate problems whose answer depends on operator precedence.
Either use one operator per expression, or rewrite with intermediate
variables (e.g. half = total : 2, then use half).

Avoid defaulting to >. When the level allows multiple comparison
operators, pick whichever best fits the narrative — do not always
choose >.
```

### Per-level prescriptive gating

`buildProblemGenerationPrompt` is extended to consume the structured `LEVEL_CONCEPTS` table. It emits two paragraphs in the system prompt:

```
Constructs allowed at level {N}: {set}
Constructs not yet introduced at this level (do NOT use): {set}
This problem MUST exercise: {required construct}
```

The "allowed" set is cumulative — all constructs from earlier levels remain available.

## Level curriculum

`LEVEL_CONCEPTS` in `src/core/api/claude.ts` becomes a structured per-level table (the existing string concept name is replaced by a `{ concept, allowed, required }` shape):

| Level | Concept (taught) | Unlocks (added to cumulative allowed set) | Required construct |
|---|---|---|---|
| 1 | Variables & Print | `WRITE`, assignment `=`, multi-arg `WRITE` | A `WRITE` statement |
| 2 | Math — add/subtract | `+`, `-` | An expression using `+` or `-` |
| 3 | Math — multiply/divide | `x`/`*`, `:`/`/` | An expression using `x` or `:` |
| 4 | Simple loops | `RIPETI N VOLTE … FINE` (N may be a variable) | A `REPEAT N TIMES … END` block |
| 5 | Counted loops | `RIPETI i DA a A b … FINE` | A `REPEAT i FROM a TO b … END` block |
| 6 | Conditions — comparison | `SE … FINE`, `>`, `<`, `=` in condition, `ALTRIMENTI` | `IF <var> > <num>` or `IF <var> < <num>` or `IF <var> = <num>` (AI picks one) |
| 7 | Conditions — parity | `PARI`/`EVEN`, `DISPARI`/`ODD` | `IF <var> EVEN` or `IF <var> ODD` (AI picks one) |
| 8 | Loops + Conditions — comparison in loop | (no new keywords) | A comparison condition inside a `REPEAT … END` |
| 9 | Loops + Conditions — parity in loop | (no new keywords) | A parity condition inside a `REPEAT … END` |
| 10 | Final | (no new keywords) | At least one condition (any form); no further constraints on shape |

The execution-engine spec already references `LEVEL_CONCEPTS` for HelpPanel auto-expansion (INV-10). The mapping `level → HelpPanel category` becomes:

- Levels 1: Writing
- Levels 2–3: Math
- Levels 4–5: Loops
- Levels 6+: Conditions

(Same as today, but level 5 now emphasizes the counted-loop card and levels 6–9 emphasize the appropriate condition card.)

## USER_GUIDE updates

`docs/USER_GUIDE.md`:

- **Print Statements** — append the multi-arg form with one example.
- **Loops** — add a "Counted loops" subsection after the existing `REPEAT N TIMES` one. Note that start and end can be variables.
- **Conditions** — add an "Even and odd" subsection after the comparison-operator list, framed as "ask whether a number is even or odd".
- **Keywords table** — add rows for `PARI`/`EVEN`, `DISPARI`/`ODD`, `DA`/`FROM`, `A`/`TO`.
- **Level Curriculum table** — rewrite to match the table above.
- **Reserved words note** under Variables — extend to mention that uppercase keywords are reserved but lowercase versions are valid variable names.
- **Deliberately undocumented** — parens, `AND`/`OR`, `REMAINDER`/`%` are not mentioned.

## HelpPanel updates

Per `execution-engine.md` INV-10a, every card's `kw` is `{ it, en }`. New cards:

- **Writing** category — add "Print several things": `kw = { it: 'SCRIVI "Hai", monete, "monete"', en: 'WRITE "You have", coins, "coins"' }`, caption "joined with a space".
- **Loops** category — add "Counted loop": `kw = { it: 'RIPETI i DA 1 A 5', en: 'REPEAT i FROM 1 TO 5' }`, caption "i counts from start to end".
- **Conditions** category — add "Even or odd": `kw = { it: 'SE mele PARI', en: 'IF apples EVEN' }`, caption "checks parity".

## Spec updates

These land in the same commit as the corresponding code change (per the project's spec-driven workflow).

`specs/codino-language.md`:

- New decisions documenting D1, D2, D4, D5 (D6 is implicit — parens are already in the grammar and the decision is to keep them undocumented; this can be noted as a non-decision).
- INV-02: extend reserved-word list with `PARI`, `EVEN`, `DISPARI`, `ODD`, `DA`, `FROM`, `A`, `TO`. Clarify uppercase-only.
- INV-04: rewrite to cover both loop forms — "loop count (whether `RIPETI N VOLTE` or `RIPETI i DA from A to`) must produce a non-negative integer ≤ 1000 at runtime; non-integer, negative, or out-of-range counts throw `RuntimeError`. For the iteration form, `from > to` also throws `RuntimeError`."
- INV-10: extend to include parity in the list of arithmetic operations where string operands throw.
- New INV: "Parity checks (`EVEN`/`PARI`/`ODD`/`DISPARI`) require an integer operand; non-integer numbers and strings throw `RuntimeError`."
- New INV: "The iteration loop variable lives in the single flat scope; its final value (= `to`) remains visible after the loop ends."

`specs/execution-engine.md`:

- INV-10: update the level → category mapping to the new curriculum (no structural change; same four categories, refined level boundaries).
- INV-10a stays valid; new HelpPanel cards follow the `{ it, en }` rule.

`specs/ai-integration.md`:

- New INV: "Every prompt that examines the player's code (`generateProblem`, `rateCode`, `generateHint`, `analyzeError`) includes the `CODINO_REFERENCE` block in its system prompt. Prompts that do not see code (`generateMap`, `generateStoryIdeas`, `testConnection`) do not."
- New INV: "`generateProblem` includes per-level construct gating in its system prompt, computed from `LEVEL_CONCEPTS`. The prompt names both the allowed constructs for the level and the required construct the generated problem must exercise."

## Tests

**Unit tests** (`tests/unit/`):

- **Grammar**: passing + failing parses for each new shape — multi-arg `WRITE`, `REPEAT <expression> TIMES`, `REPEAT i FROM a TO b`, parity in condition. Negative cases: `FROM` as lowercase identifier (should parse as identifier), uppercase `A` as variable name (should error), parity without preceding expression.
- **Interpreter — multi-arg print**: single arg unchanged; two args space-joined; three+ args; mixed string/number; output is one trace step per `Print`.
- **Interpreter — expression as REPEAT count**: variable, sum expression, literal — all reach the same execution; `>1000` still throws; non-integer expression result throws; negative result throws.
- **Interpreter — iteration loop**: `FROM 1 TO 5` produces 5 iterations with `i` taking 1..5; `FROM 3 TO 3` runs once; `FROM 5 TO 1` throws; `(to - from + 1) > 1000` throws; bounds from variables work; `i` is visible and equals `to` after the loop ends; pre-existing variable `i` is overwritten.
- **Interpreter — parity**: `4 EVEN` true, `4 ODD` false, `-4 EVEN` true, `0 EVEN` true; non-integer (`5.5`) throws; string (`"hi" EVEN`) throws.
- **Prompt builders**: snapshot tests confirming `CODINO_REFERENCE` appears in the system prompt of `buildProblemGenerationPrompt`, `buildStarRatingPrompt`, `buildHintPrompt`, `buildErrorAnalysisPrompt`, and does not appear in `buildMapGenerationPrompt`, `buildStoryIdeasPrompt`. Plus tests that `buildProblemGenerationPrompt` includes per-level allowed-constructs and required-construct paragraphs derived from `LEVEL_CONCEPTS`.

**E2E tests** (`tests/e2e/`): one happy-path per construct, asserting the ExecutionPanel output. Five new tests — multi-arg print, expression-as-count loop, iteration loop with `i` visible in variables, parity-true branch, parity-false branch.

## Migration

- Game state in `localStorage` does not include level source code (only story, completed levels, stars, current level), so no saved code can break.
- In-progress code in the editor at the moment of upgrade *could* break in one narrow case: a player who happens to have typed an uppercase `A`, `FROM`, `TO`, `PARI`, `EVEN`, `DISPARI`, `ODD`, or `DA` as a variable name. Worst case the player retypes the level. Acceptable for a localStorage-only game.
- No state-shape migration or localStorage version bump needed.

## Rollout

Three commit-boundary slices. Each leaves the app in a working state.

1. **Grammar + interpreter + unit tests + `codino-language.md` updates.** Parser regen via `npm run build:grammar`. After this commit, the language is extended but the AI doesn't yet exercise the new constructs.
2. **Prompts + `LEVEL_CONCEPTS` + `ai-integration.md` updates.** `CODINO_REFERENCE` constant + prescriptive per-level gating + new curriculum. After this commit, problems start using the new constructs.
3. **USER_GUIDE + HelpPanel cards + `execution-engine.md` updates.** Player-facing documentation matches the now-active behaviour.

One PR is fine if preferred; the three-commit shape is for review clarity.
