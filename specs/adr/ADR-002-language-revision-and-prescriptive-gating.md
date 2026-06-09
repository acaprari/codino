# ADR-002: Codino language revision and prescriptive AI gating

## Status

Accepted · 2026-06-09

## Context

After the Aurora redesign (ADR-001) shipped, real playthroughs surfaced a cluster of problems concentrated in two places: the Codino mini-language itself, and the AI's problem-generation pipeline. The two surfaces are coupled — the AI generates problems against the language's grammar and against the strict exact-string output validation — so symptoms in one place often had causes in the other.

Five concrete patterns emerged during play:

1. **The AI frequently expected combined output strings.** Problems naturally asked for "Animals: 5" on one line, but the language had no construct to combine a string and a variable in a single `WRITE`. The player had to print on two lines and the expected output never matched.
2. **The AI generated parity (even/odd) problems.** Parity is a real 7–8 curriculum concept, but the language had no modulo or remainder operator — no way to express the check at all.
3. **Rating explanations referenced Python by name.** Sonnet was pattern-matching Codino code (`apples = 5`, `WRITE apples`) to Python and writing explanations in those terms. The cross-language confusion eroded the child's mental model of "this is its own language".
4. **Condition operators got little airtime.** Even at levels nominally teaching conditions, the AI's choice of construct skewed heavily toward arithmetic. The per-level prompt allowed `>`, `<`, `=` but never required them, so the model dodged.
5. **Loop counts had to be literal integers.** A child writing `monsters = 5; REPEAT monsters TIMES` got a parse error. The natural phrasing of the most common problem shape was blocked.

A subsequent round of smoke testing on the just-merged changes surfaced two more problems, both in the AI prompt:

6. **The AI produced step-by-step prose recipes.** "Use a variable called totale and multiply 6 by 8, then print totale." The child solved by transcription, not by problem-solving.
7. **Generated problems required typing emojis as program output.** Engaging in the narrative but unreasonable on a child's keyboard.

The fixes touch language, AI pipeline, UI, and curriculum simultaneously. The capability specs hold the resulting invariants, but the cross-cutting *why* — what was added, what was deliberately deferred, and how the AI's role shifted from permissive to prescriptive — is recorded here.

## Decision

A cluster of coupled changes, captured as one architectural shift.

### Language additions for the 7–8 tier

Four constructs were added to the Codino grammar and interpreter:

1. **Multi-argument `WRITE` / `SCRIVI` with comma separator and space join.** `WRITE "Animals:", apples` prints `Animals: 5` on a single line. Comma-separated arguments are evaluated independently, `String()`-coerced, and joined with a single space.
2. **Named parity in conditions.** `IF n EVEN` / `SE n PARI` and the `ODD`/`DISPARI` counterparts as postfix forms. Parity is exposed as a named property of an integer, not as a modulo computation.
3. **Iteration-variable loop.** `REPEAT i FROM a TO b … END` / `RIPETI i DA a A b … FINE`. The variable `i` (or any name) binds for the duration of the loop body, counts inclusively, and remains visible after the loop in the flat scope.
4. **Expression as loop count.** The existing `REPEAT N TIMES` form accepts any expression — variable, sum, computation — in the count position. The 1000-iteration runtime cap and integer validation still apply.

The `Loop` AST node is replaced by two direct alternatives in `statement`: `CountLoop` and `RangeLoop`. There is no wrapper `Loop` node.

Parentheses remain in the grammar but stay undocumented to the player. The AI is instructed not to generate problems whose answer depends on operator precedence.

### Age-tier framework for deferred constructs

The language is positioned as one tier in a future multi-age curriculum. Constructs were *considered* and *deferred* rather than rejected outright; the grammar is the same across tiers, but the AI's gating and the player-facing surface (USER_GUIDE, HelpPanel) control what gets introduced.

Deferred to a future **9–10 tier**: `AND` / `OR` in conditions, single-line comments, negative number literals, `REMAINDER` / modulo, possibly `WHILE` loops. Each was placed there for a specific cognitive reason — boolean composition is genuinely harder than comparison; meta-cognitive comments are uncommon at 7–8; modulo is too abstract when parity covers the named case.

Deferred to a future **11–13 tier**: functions, arrays, input, string manipulation.

This framework matters for future-readers because it justifies the *omissions* the current tier makes. The grammar's narrowness is intentional, not incidental.

### AI integration: from permissive to prescriptive

The AI's role in problem generation shifted in posture, not just in detail.

1. **Shared `CODINO_REFERENCE` card.** A single string constant in `prompts.ts` is injected into the system prompt of every call that *generates or evaluates* Codino code: `buildProblemGenerationPrompt`, `buildStarRatingPrompt`, `buildHintPrompt`, `buildErrorAnalysisPrompt`. The card names the language, lists bilingual keywords and operators, explains the `=` dual meaning, and forbids referencing Python or other languages by name. Map-generation and story-ideas calls never see code and are not injected.
2. **`LEVEL_CONCEPTS` becomes structured per-level gating.** Each level entry has `concept`, `unlocks`, and `required`. The problem-generation prompt emits three paragraphs derived from it — the cumulative allowed set, the not-yet-introduced (forbidden) set, and the construct the generated problem *must* exercise. The gating is **prescriptive**: each level names a specific construct the problem must contain.
3. **Curriculum reshape across levels 6–9.** Level 6 introduces a comparison condition (one of `>`, `<`, `=`, AI's choice with a diversity nudge). Level 7 introduces parity. Level 8 combines comparison with a loop. Level 9 combines parity with a loop. Level 10 is freeform but must contain at least one condition.
4. **Five-rule constraint block on problem generation.** Independent of per-level gating, every problem-generation prompt carries five constraints: (a) the narrative contains no Codino code, code blocks, or keyword examples; (b) literal output strings are quoted verbatim in the narrative; (c) `expectedOutput` is restricted to ASCII letters, accented Latin vowels (`à á è é ì í ò ó ù ú` and uppercase), digits, single spaces, and basic punctuation — emojis, smart quotes, em/en dashes, and other Unicode symbols are forbidden; (d) the narrative ends with an unambiguous print instruction of the form `Print "<exact text>"` or `Print the value of <variable>`; (e) the narrative describes the *situation* but never the *solution* — no naming variables for the player, no step-by-step ordering, no naming Codino constructs in code or prose form.

The prescriptive shift is the most architecturally important piece. Permissive prompts trust the model to use its allowance; prescriptive prompts constrain it to a specific behavior the curriculum needs.

## Rejected alternatives

### For multi-arg `WRITE`

- **Whitespace-separated arguments** (`WRITE "Animals:" apples`) — rejected as visually ambiguous; comma makes the separator obvious.
- **Comma-separated, no glue** (`WRITE "Animals: ", apples`) — rejected because trailing-space-in-string formatting is fiddly at this age.
- **Relax INV-10 to allow string concatenation via `+`** — rejected because it overloads `+` for two operations (add numbers, join strings) and contradicts the spec's deliberate strictness around string operands.
- **Constrain the AI to never combine string + number on one line** — rejected because it permanently rules out the most natural problem phrasings.

### For parity

- **`REMAINDER` / modulo operator** — rejected because remainder-after-dividing is genuinely abstract for 7–8 year olds. Parity is a named property in their school math; modulo is a tool.
- **Both `EVEN`/`ODD` and `REMAINDER`** — rejected as doubled surface area for marginal benefit at this age.
- **Skip parity entirely (AI never generates parity problems)** — rejected because parity is a concept already in their curriculum.

### For range loop

- **Defer to the 9–10 tier** — rejected because counted iteration is the most natural form for the most common 7–8 problems ("print 1 to N", "sum 1 to N"). The visible counter in the execution panel reinforces the learning.
- **`WHILE` loops instead** — rejected as too abstract for the age; `WHILE` is held for the 9–10 tier.
- **Wrap both forms in a `Loop` AST node** — rejected because the wrapper added dispatch overhead with no value; `CountLoop` and `RangeLoop` as direct `statement` alternatives is cleaner.

### For the AI Codino reference card

- **Inline gating per prompt without a shared constant** — rejected because drift across prompt builders is inevitable as the language evolves.
- **Reference card plus a one-shot example program** — held in reserve. The constant alone proved sufficient; the one-shot can be added later if model output proves unreliable.

### For per-level gating

- **Permissive gating with a "vary your choices" diversity nudge** — what we had before. Rejected after observed under-use of comparison operators even at condition-teaching levels.
- **Deterministic per-level operator** (level 6 always `>`, level 7 always `EVEN`, etc.) — rejected because every playthrough would drill the same first operator. AI's choice within the allowed set with a per-call diversity nudge gives variation without extra plumbing.
- **Story-seeded operator choice** — rejected as marginal value for extra complexity.

### For the constraint block

- **Runtime validation of `expectedOutput`** (reject responses with emoji codepoints, retry) — held in reserve. The prompt alone is currently sufficient; this is the planned escalation step.
- **Per-level scaffolding intensity knob** (`scaffoldingLevel: 'high' | 'low'` per level) — rejected because the general "situation, not solution" rule subsumes the level-1 case naturally (at level 1 the operation *is* the situation).
- **Strict ASCII only in `expectedOutput`** — rejected because Italian narratives produce `perché`, `così`, etc. The allowlist explicitly includes accented Latin vowels but not `ç`/`ñ`/`ü`, since the game's languages are Italian and English only.

### For age tiers

- **Add `AND`/`OR` now** — rejected because reliable two-condition reasoning is a 9–10 skill; colloquial AND is fine at 7–8 but not a curriculum concept.
- **Add comments now** — rejected because self-documentation requires meta-cognition that 7–8 year olds rarely apply voluntarily.
- **Add modulo now (alongside parity)** — rejected as doubled surface area; modulo is the 9–10 tool that subsumes parity, not the 7–8 form.

## Consequences

- Three capability specs update in step with the code: `codino-language.md` (D-decisions for the four constructs and the four corresponding INVs), `ai-integration.md` (D-decisions for `CODINO_REFERENCE` and prescriptive gating, plus three new INVs), `execution-engine.md` (INV-10 reflects the structured `LEVEL_CONCEPTS`). The `game-state` capability is **unaffected** — store contracts and persistence are untouched.
- `editor.md` INV-06 stays as written (interpreter emits English; `RuntimeErrorCard` translates to Italian). Eleven new error messages were added to the interpreter; the Italian translations are added in lockstep and regression-tested.
- The USER_GUIDE and the HelpPanel get new entries reflecting the additions; the level curriculum table is rewritten.
- The age-tier framework is captured here for the first time. Adding a 9–10 or 11–13 tier later will fall out of this ADR's structure: same grammar accepts everything, the tier gates introduction.
- The permissive→prescriptive shift in AI gating is the durable directional choice. Future capability additions (new constructs, new levels) should follow the prescriptive pattern rather than reverting to "allow and hope".

## Postscript: spec-driven discipline and iterative tightening

This change set was carried out as a spec-driven experiment — each commit updated the relevant capability spec alongside the code, and `spec:validate` was run before considering the branch complete. The branch's design and plan docs live under `docs/superpowers/` (specs/ and plans/) as session artifacts of that process.

The constraint block in §4 of the Decision section reached its final five-rule form in two iterations. The first four rules were drafted from the initial smoke-test findings; rule 5 was added after a second round of smoke testing revealed the AI was being too prescriptive in early-level narratives. The iteration is noted here because it is part of the spec-driven experiment's posture: ship, test against real model output, tighten. The rules are presented as a unified outcome in the Decision because that's what the curriculum and the invariants describe; the iteration trail is for context only.

## References

- Implementation companions (session artifacts): `docs/superpowers/specs/2026-06-07-codino-language-revision-design.md`, `docs/superpowers/specs/2026-06-08-problem-generation-constraints-design.md`, `docs/superpowers/specs/2026-06-08-narrative-prescription-design.md`
- Plans for the same: `docs/superpowers/plans/2026-06-07-codino-language-revision.md`, `docs/superpowers/plans/2026-06-08-problem-generation-constraints.md`, `docs/superpowers/plans/2026-06-08-narrative-prescription.md`
- Pull request: [PR #2 — Codino language revision](https://github.com/acaprari/codino/pull/2)
