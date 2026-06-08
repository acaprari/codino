# Narrative Prescription — Design

**Date:** 2026-06-08
**Scope:** Add a fifth rule to `buildProblemGenerationPrompt`'s constraint block: "Describe the situation, not the solution." Second follow-up to the 2026-06-07 Codino language revision (PR #2), driven by continued smoke testing.

## Background

After landing the four-rule constraint block from `2026-06-08-problem-generation-constraints-design.md` (and pushing the fix to PR #2), continued smoke testing of the early levels (1–5) surfaced a new problem: the AI is now generating *too explicit* problem statements that effectively dictate the solution step-by-step in prose.

Examples observed in Italian playthrough:

> "Il coraggioso cavaliere 🛡️ ha trovato 6 sacchi di monete d'oro durante la sua avventura! Ogni sacco contiene 8 monete. **Usa una variabile chiamata "totale" e calcola quante monete ha in tutto moltiplicando 6 per 8. Poi stampa il valore di totale.**"

> "Il coraggioso cavaliere incontra 4 draghi lungo il sentiero del tesoro! 🐉 Per ogni drago che incontra, il cavaliere deve alzare il suo scudo e dire una parola di coraggio. **Aiuta il cavaliere: usa una variabile chiamata 'draghi' con valore 4, poi ripeti 4 volte la stampa della parola "Coraggio!". Stampa "Coraggio!" per ogni drago.**"

The bold portion in each case is the program written in prose — variable names, construct choice ("ripeti 4 volte la stampa di…" is `REPEAT 4 TIMES WRITE "…" END` translated to Italian), and step ordering. A 7–8 y.o. can solve these by transcription, not by problem-solving. The intended learning loop — *read a situation → decide which construct fits → write code* — is short-circuited.

The pattern self-corrected at later levels (the user reported it disappeared around level 4–5 in the same playthrough), which suggests the AI is naturally more verbose at intro levels but our prompt isn't pushing back against verbosity in either direction.

This is the same surface (`buildProblemGenerationPrompt` system prompt) as the previous constraint fix, so the natural place to address it is one new rule + a tightened example in an existing rule.

## Goals and non-goals

**Goals:**
- Stop the AI from dictating variable names, step ordering, or construct choice in the narrative.
- Stop the AI from describing Codino constructs in prose form (`ripeti 4 volte la stampa di …` is `REPEAT … TIMES WRITE … END` in Italian and should be treated identically to a code block under Rule 1).
- Preserve the gains from the four-rule block: typeable output, verbatim quoting, explicit print instruction.

**Non-goals:**
- No per-level scaffolding tuning (the alternative considered was a `scaffoldingLevel: 'high' | 'low'` knob in `LEVEL_CONCEPTS`; rejected as premature curriculum surface).
- No special-casing of level 1. The general rule covers the level 1 case naturally — at level 1 the operation IS the situation ("print the number 5" is fine because there's no separate situation-vs-solution distinction).
- No runtime detection of prescriptive narratives.

## Decisions

### D1 — Add Rule 5 to the constraint block: "Describe the situation, not the solution"

Inserted after Rule 4 in `buildProblemGenerationPrompt`'s constraint block:

```
5. Describe the situation, not the solution. The narrative tells the
   player WHAT the program should achieve and what literal text or
   computed value to print — never HOW. Forbidden: naming variables for
   the player, breaking the solution into steps, telling the player
   which Codino construct to use (REPEAT, IF, etc.), or translating
   constructs into prose (e.g. "ripeti 4 volte la stampa di X" is just
   REPEAT in prose and is forbidden). Bad: "Use a variable called totale
   and multiply 6 by 8, then print totale." Good: "The knight has 6
   bags with 8 coins each. Print the total number of coins."
```

The rule names the four specific anti-patterns observed in smoke testing (named variables, step-by-step ordering, construct choice, prose-form constructs) and pairs a Bad/Good example so the AI has a concrete contrast to reason against.

**Alternatives considered:**
- *Per-level `scaffoldingLevel` flag in `LEVEL_CONCEPTS`.* Rejected — adds curriculum-tuning surface area without clear benefit; the general rule subsumes the level-1 case naturally.
- *Re-word Rule 4's "Print … instruction" to be tighter.* Rejected — Rule 4 is correct as written; the failure mode is the AI dictating the whole program, not just the print instruction. A separate rule is clearer than overloading Rule 4.

### D2 — Tighten Rule 1's value-mention example

Rule 1 currently includes:

> Specific values needed (like "set apples to 8") must be stated in natural language.

The example "set apples to 8" is itself prose-form code (it's `apples = 8` rephrased). Replace with a situation-form example:

> Specific values must appear in natural language — say "the knight has 8 apples", not "set apples to 8".

This aligns Rule 1's example with the spirit of Rule 5 and removes the contradiction that the previous wording inadvertently endorsed.

### D3 — Ship as a single follow-up commit on the same PR branch

PR #2 is still open. The fix is small (≈15 lines of prompt text, ≈2 tests, ≈1 invariant edit) and scoped to the same files the previous constraint commit touched. Lands as one additional commit on `codino-language-revision` with the existing PR description still accurate.

## Implementation

### Prompt change

`src/core/api/prompts.ts::buildProblemGenerationPrompt` — modify the `## Constraints on the problem you generate` block:

1. Edit Rule 1's last sentence per D2 above.
2. Append Rule 5 after Rule 4 per D1 above.

No other prompt builder or function is modified.

### Test additions

`tests/unit/api/claude.test.ts` — inside the existing `describe('problem-generation constraints', ...)` block, append:

```typescript
it('generateProblem prompt forbids prescriptive step-by-step narratives (rule 5)', async () => {
  await genProblem();
  const p = lastSystemPrompt();
  expect(p).toMatch(/Describe the situation, not the solution/i);
});

it('generateProblem prompt includes the situation-vs-solution contrast example (rule 5)', async () => {
  await genProblem();
  const p = lastSystemPrompt();
  expect(p).toContain('The knight has 6 bags with 8 coins each. Print the total number of coins.');
});
```

The existing six tests pinning Rules 1–4 stay unchanged — none of them assert anything that the new Rule 5 contradicts.

### Spec change

`specs/ai-integration.md` — update INV-14 in place. Replace the existing clause-list "(a) … (b) … (c) … (d) …" with five clauses:

> INV-14: `generateProblem`'s system prompt (built by `buildProblemGenerationPrompt`) includes a "Constraints on the problem you generate" section listing five rules: (a) the narrative must contain no Codino code, code blocks, or keyword examples; (b) every literal string the player must print appears in the narrative inside double quotes, verbatim; (c) `expectedOutput` is restricted to ASCII letters, the accented Latin vowels `à á è é ì í ò ó ù ú` (and uppercase), digits, single spaces, and basic punctuation — emojis, smart quotes, em/en dashes, and other Unicode symbols are forbidden; (d) the narrative ends with an unambiguous print instruction of the form `Print "<exact text>"` or `Print the value of <variable>`; (e) the narrative describes the situation but never the solution — variables are not named for the player, the solution is not broken into steps, no Codino construct is named (in code or prose form).

## Tests

Two new unit tests per the Implementation section. No e2e change. No manual smoke checklist update — the user is already smoke-testing and will validate this same flow.

## Rollout

Single commit on `codino-language-revision`. PR #2 description is still accurate. After the auto checks go green and your smoke testing confirms the fix, the PR is ready for squash-and-merge alongside the rest of the language-revision work.

## Out of scope (deferred)

- Per-level scaffolding intensity (`scaffoldingLevel: 'high' | 'low'` in `LEVEL_CONCEPTS`) — hold until a future case demonstrates the general rule is insufficient.
- Runtime check that detects prescriptive narratives and rejects them — same hold condition.
- Changes to `buildHintPrompt`. The hint surface has its own "do not reveal the solution" instruction; if hints leak prescription, that's a separate finding to track.
