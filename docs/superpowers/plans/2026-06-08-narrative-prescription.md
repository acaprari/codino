# Narrative Prescription Constraint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth rule to `buildProblemGenerationPrompt`'s constraint block that forbids the AI from generating step-by-step prescriptive narratives (variable names, construct choice, prose-form constructs). Also tighten Rule 1's value-mention example to remove an inadvertent permission.

**Architecture:** Single change to `src/core/api/prompts.ts::buildProblemGenerationPrompt` — edit Rule 1's example value, append Rule 5 after Rule 4. Add two snapshot-style unit tests. Update INV-14 in `specs/ai-integration.md` to list five rules. One commit on the existing `codino-language-revision` branch.

**Tech Stack:** TypeScript, Vitest.

**Source spec:** `docs/superpowers/specs/2026-06-08-narrative-prescription-design.md`

---

## Notes for the implementer (read before starting)

- The branch `codino-language-revision` already has 28 commits on it, including the previous four-rule constraint block from commit `b3137a0`. This plan adds **one** follow-up commit.
- Stay on `codino-language-revision`. Do not push, do not switch branches, do not amend earlier commits.
- The fix is prompt text only. No runtime/grammar/interpreter changes. No new files.

---

### Task 1: Add Rule 5 (situation-not-solution) and tighten Rule 1's example

**Files:**
- Modify: `src/core/api/prompts.ts` (`buildProblemGenerationPrompt` system template — Rule 1 wording, append Rule 5)
- Modify: `tests/unit/api/claude.test.ts` (two new tests in the existing `problem-generation constraints` describe block)
- Modify: `specs/ai-integration.md` (INV-14 in place)

- [ ] **Step 1: Write the failing tests**

Open `tests/unit/api/claude.test.ts`. Find the existing `describe('problem-generation constraints', ...)` block inside the outer `describe('ClaudeAPIClient', ...)`. Append two tests at the end of that inner describe (before its closing `})`):

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

The `genProblem` and `lastSystemPrompt` helpers already exist in the same describe block — reuse them, do not redefine.

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/unit/api/claude.test.ts
```

Expected: the two new tests fail. Every other test in the file (the six existing constraint tests plus the gating + CODINO_REFERENCE tests from earlier work) must still pass.

- [ ] **Step 3: Tighten Rule 1's value-mention example**

In `src/core/api/prompts.ts::buildProblemGenerationPrompt`, find Rule 1 in the `## Constraints on the problem you generate` block. The current last sentence of Rule 1 reads:

```
   language only. Specific values needed (like "set apples to 8") must
   be stated in natural language.
```

Replace those two lines with:

```
   language only. Specific values must appear in natural language —
   say "the knight has 8 apples", not "set apples to 8".
```

(Rule 1's first sentence and middle-clause list of forbidden forms stay unchanged. Only the closing sentence is edited.)

- [ ] **Step 4: Append Rule 5 to the constraint block**

In the same `## Constraints on the problem you generate` block, find Rule 4 (which currently ends with `... The player must know the final output just from reading the narrative.`). Append Rule 5 immediately after Rule 4, before the `Return ONLY a valid JSON object` line. The added text is exactly:

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

(Note the leading blank line so Rule 5 is visually separated from Rule 4, matching the pattern between the other rules.)

Rule 5 contains no backticks, so no template-literal escaping is needed. Spot-check the resulting source by reading the file before continuing.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/unit/api/claude.test.ts
```

Expected: all eight tests in the `problem-generation constraints` describe block now pass (six pre-existing + two new). Every other test in the file still passes.

- [ ] **Step 6: Update INV-14 in `specs/ai-integration.md`**

Open `specs/ai-integration.md`. Find INV-14 (most recently updated by commit `b3137a0`). It currently begins with `INV-14: \`generateProblem\`'s system prompt (built by \`buildProblemGenerationPrompt\`) includes a "Constraints on the problem you generate" section listing four rules:` and continues with `(a) … (b) … (c) … (d) …`.

Replace the whole INV-14 paragraph with:

```markdown
INV-14: `generateProblem`'s system prompt (built by `buildProblemGenerationPrompt`) includes a "Constraints on the problem you generate" section listing five rules: (a) the narrative must contain no Codino code, code blocks, or keyword examples; (b) every literal string the player must print appears in the narrative inside double quotes, verbatim; (c) `expectedOutput` is restricted to ASCII letters, the accented Latin vowels `à á è é ì í ò ó ù ú` (and uppercase), digits, single spaces, and basic punctuation — emojis, smart quotes, em/en dashes, and other Unicode symbols are forbidden; (d) the narrative ends with an unambiguous print instruction of the form `Print "<exact text>"` or `Print the value of <variable>`; (e) the narrative describes the situation but never the solution — variables are not named for the player, the solution is not broken into steps, no Codino construct is named (in code or prose form).
```

(Single paragraph. The only changes vs. the current INV-14 are: "four rules" → "five rules"; semicolon-separated clauses end with `(d) …` → `(d) …; (e) …`.)

- [ ] **Step 7: Run the full unit suite to confirm no regressions**

```bash
npm test
```

Expected: 224 tests pass (222 from the end of commit `b3137a0` plus 2 new).

- [ ] **Step 8: Commit**

```bash
git add src/core/api/prompts.ts tests/unit/api/claude.test.ts specs/ai-integration.md
git commit -m "$(cat <<'EOF'
feat(ai): forbid prescriptive step-by-step narratives in problem generation

Adds a fifth rule to buildProblemGenerationPrompt's constraint block:
"Describe the situation, not the solution." Forbids naming variables
for the player, breaking solutions into steps, naming Codino constructs
(in code or prose form). Also tightens Rule 1's value-mention example
from "set apples to 8" (prose-form code) to "the knight has 8 apples"
(situation form). Closes the second smoke-test finding from PR #2.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Self-review checklist

- ✅ Spec D1 (Rule 5 wording): Step 4 inserts the exact Rule 5 text from the spec.
- ✅ Spec D2 (Rule 1 example): Step 3 replaces "set apples to 8" example with "the knight has 8 apples" per the spec.
- ✅ Spec D3 (single commit, same branch): Step 8 commits all three files atomically; no branch operations, no push, no amend.
- ✅ Spec "Test additions": Step 1 adds exactly the two tests specified.
- ✅ Spec "Spec change": Step 6 updates INV-14 to "five rules" with clause (e) added.
- ✅ No placeholders, no "TBD", no "similar to Task N".
- ✅ Type/name consistency: `genProblem`, `lastSystemPrompt`, `mockCreate`, `STORY`, `ELEMENT` all exist in the target describe block already; the new tests reuse them by closure (verified against the post-`b3137a0` state of `claude.test.ts`).
