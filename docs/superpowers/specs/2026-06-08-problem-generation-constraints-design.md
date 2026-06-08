# Problem-Generation Constraints — Design

**Date:** 2026-06-08
**Scope:** Tighten `buildProblemGenerationPrompt` so the AI generates problems that respect the strict exact-match output validation. Follow-up to the 2026-06-07 Codino language revision (PR #2), driven by manual smoke-test findings.

## Background

After landing the language revision and starting smoke tests against real model output, four distinct classes of problem-generation failure surfaced:

1. **Embedded code hints.** Generated narratives sometimes include a full code block as a hint, exposing the solution before the player writes anything.
2. **Output strings not provided verbatim.** Problems that require printing a specific string (e.g. "Watch out!") describe the *situation* without telling the player the literal string to print. Validation is exact-match, so the player has to guess between several plausible paraphrases.
3. **Vague problem statements (especially at level 10).** Some problems describe a goal narratively without specifying what the program must output.
4. **Emojis in expected output.** Problems sometimes require the player to print an emoji as part of the expected output, but emojis are hard for 7–8 y.o. to type on a keyboard.

All four share the same root cause: the AI is being narratively creative without respecting the strict exact-string-match validation downstream. The fix is a four-rule constraint block added to the problem-generation system prompt.

## Goals and non-goals

**Goals:**
- Make every generated problem solvable without guessing the output string.
- Forbid emojis in `expectedOutput` while keeping them encouraged in the narrative.
- Forbid code (in any form) from appearing in the narrative.
- Add tests pinning the constraint block in the prompt.

**Non-goals:**
- No runtime validation of `expectedOutput`. We trust the prompt. If the AI still violates after this change, a sanity-check + retry could be added in a follow-up.
- No changes to `buildStarRatingPrompt`, `buildHintPrompt`, `buildErrorAnalysisPrompt`, or `buildMapGenerationPrompt`. The four findings are all problem-generation issues.
- No grammar or interpreter changes. No UI changes. No spec updates beyond `ai-integration.md`.

## Decisions

### D1 — Four-rule constraint block in the problem-generation prompt

A new "## Constraints on the problem you generate" section is added to the system prompt of `buildProblemGenerationPrompt`, placed between the per-level gating block and the "Return ONLY a valid JSON object" line.

The block contains exactly four rules:

```
## Constraints on the problem you generate

1. The narrative must NOT contain any Codino code. Forbidden: code blocks
   (triple-backtick fences), variable assignments (e.g. `x = 5`), Codino
   keywords used as code examples (e.g. `WRITE "hi"` or `IF n > 5`), and
   partial or complete solutions. Describe the situation in natural
   language only. Specific values needed (like "set apples to 8") must
   be stated in natural language.

2. Every literal string the player must print MUST appear in the narrative
   inside double quotes, exactly as it should be printed. Example: if the
   expected output is `Watch out!`, the narrative must contain the words
   "Watch out!" literally — the player must be able to read the string
   off the narrative without paraphrasing.

3. The `expectedOutput` field must contain ONLY: letters a–z, A–Z, the
   accented Latin vowels à á è é ì í ò ó ù ú and their uppercase
   counterparts, digits 0–9, single spaces, and basic punctuation:
   . , ! ? : ; ' " - ( ). NO emojis. NO smart quotes (' " “ ”). NO em or
   en dashes (— –). NO arrows or math symbols. Emojis are encouraged in
   the narrative for engagement but never in `expectedOutput`.

4. The narrative must end with one clear, unambiguous instruction telling
   the player what to print. Format: `Print "<exact text>"` or `Print the
   value of <variable>`. No metaphor, no ambiguity. The player must know
   the final output just from reading the narrative.
```

**Alternatives considered:**
- *Also strengthen `CODINO_REFERENCE`.* Rejected — the rules are about problem *generation*, not about evaluating player code. Adding them to the shared reference card would be noise for rate/hint/error builders.
- *Add a separate `outputInstruction` JSON field.* Rejected — the verbatim-quote rule in the existing single narrative field is simpler and doesn't add UI surface.
- *Loosen the runtime exact-match validation instead.* Rejected — the strict match is a deliberate spec choice (execution-engine INV-04) and lowering it just shifts the ambiguity downstream.

### D2 — Character set for `expectedOutput`: ASCII + accented Latin vowels only

Rule 3's allowlist is intentionally narrow:
- Latin letters `a–z A–Z`.
- Accented Latin vowels and their uppercase forms only: `à á è é ì í ò ó ù ú`.
- Digits `0–9`.
- Space (no tabs; no embedded newlines — line separators come from separate `WRITE` statements).
- Basic punctuation: `. , ! ? : ; ' " - ( )`.

Explicitly forbidden, even though they look harmless: `ç`, `ñ`, `ü` (not part of Italian or English), smart quotes, em-dash, en-dash, arrows, math symbols. These would all fail strict equality against what a kid types on a normal keyboard.

**Alternatives considered:**
- *Strict ASCII only.* Rejected — Italian narratives naturally produce `perché`, `così`, etc.; forcing `perche` feels unnatural.
- *Allow most Unicode, only ban emojis.* Rejected — smart quotes and em-dashes are exactly the kind of "looks identical, doesn't match" trap that breaks exact validation silently.

### D3 — Ship as a single follow-up commit on the existing PR branch

The fix is small (~40 lines of prompt text, ~20 lines of tests) and scoped to the same file (`prompts.ts`) the PR already touches. It lands as one commit on `codino-language-revision` while PR #2 is still open, rather than as a separate PR.

## Implementation

`src/core/api/prompts.ts::buildProblemGenerationPrompt` — insert the four-rule block between the existing per-level gating paragraphs and the "Return ONLY a valid JSON object" line. No other functions in this file are modified.

`tests/unit/api/claude.test.ts` — append a new describe block "problem-generation constraints" with two tests:

1. The generated system prompt contains the constraints section header ("Constraints on the problem you generate").
2. The prompt contains an explicit no-emojis-in-expectedOutput clause (substring match on something stable like "NO emojis" plus "expectedOutput" within ~200 chars of each other, or two separate substring matches).

`specs/ai-integration.md` — add one new invariant:

> **INV-14:** `buildProblemGenerationPrompt`'s system prompt includes a "Constraints on the problem you generate" section listing four rules: (a) no Codino code in the narrative, (b) every literal output string quoted verbatim in the narrative, (c) `expectedOutput` restricted to ASCII letters, accented Latin vowels (`à á è é ì í ò ó ù ú` and uppercase), digits, single spaces, and basic punctuation — emojis and other Unicode forbidden, (d) narrative ends with an unambiguous print instruction.

## Tests

- 2 new unit tests in `tests/unit/api/claude.test.ts` (per Implementation above).
- No e2e test needed — the constraint is on prompt text, not runtime behavior.
- No manual smoke test added to the AI-SMOKE-CHECKLIST; the user is already running smokes and will validate by playing through.

## Rollout

Single commit on `codino-language-revision`. The PR description doesn't need updating — this is a fix in scope of "AI prompts" already listed in the summary. Once merged with the rest of PR #2, no separate follow-up release is needed.

## Out of scope (deferred)

- Runtime sanity check on `expectedOutput` rejecting responses with emoji codepoints, with automatic retry. Hold until smoke shows the prompt alone is insufficient.
- Constraints on `buildHintPrompt` (the AI hint surface already has a "do not reveal the solution" instruction; if it leaks code, that's a separate finding).
- Constraints on `buildMapGenerationPrompt` (it doesn't produce code-bearing output).
