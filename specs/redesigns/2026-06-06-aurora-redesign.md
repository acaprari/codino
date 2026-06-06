# Aurora redesign

**Date:** 2026-06-06
**Status:** Approved · Not yet implemented
**Scope:** Full UI redesign — visual system, layout structure, screen consolidation

This document is a **forward-looking design spec**. It captures the validated design before implementation. Once the redesign ships, the affected capability specs (`map-visualization`, `editor`, `story-onboarding`, `execution-engine`, `settings`) will be updated to reflect the new state, and this document becomes a historical record of the redesign decision.

## Motivation

The original UI was assembled component-by-component without a unifying visual system. Three problems emerged in testing:

1. **No coherent aesthetic.** The app uses seven distinct UI colors (purple, blue, green, yellow, pink, red, gray) with no clear role assignment. The "feel" doesn't communicate the story-adventure premise — it reads as a utility, not a children's narrative game.
2. **Too many screen transitions.** A single play session jumps through welcome → story → generating → map → editor → executing → success → map → editor again. Each transition has its own loading and layout. The mental model is fragmented.
3. **Underused desktop real estate.** The editor screen has just two panes (problem + editor) on a desktop browser, leaving large blank margins. Auxiliary information (current level, stars earned, language reference, progress through the adventure) lives on screens the player has navigated away from.

The redesign addresses all three with:
- A unified **Aurora visual system** (gradient background, glass surfaces, disciplined palette)
- A **single workspace** that absorbs the play loop; previously separate screens become overlays or are eliminated
- A **four-pane layout** that uses desktop width: top status, main problem+editor, right help/output, bottom map

## What this redesign replaces

The redesign touches every UI-rendering decision in five capability specs:

- `specs/map-visualization.md` — the SVG winding-path map is **removed entirely**. Map state moves into a horizontal strip at the bottom of the workspace.
- `specs/editor.md` — editor stays but is embedded in the workspace; problem panel becomes a sibling pane above; run/help buttons restyled.
- `specs/story-onboarding.md` — welcome screen and story input collapse into a single first-launch modal; the generating screen becomes an inline shimmer.
- `specs/execution-engine.md` — execution mode is no longer a separate screen; it's a state change of the workspace right panel.
- `specs/settings.md` — settings stays a modal, restyled with glass.

Capability specs whose **decisions and invariants** are unaffected (parser/interpreter behavior, store contracts, persistence, AI integration) remain as-is.

## Layout

### The workspace

The workspace is the always-on home. Four panes in a fixed grid:

```
┌───────────────────────────────────────────────────────┐
│ TOP BAR  (~48 px)                                      │
│ logo · level X / 10 · ⭐ count · ⚙                     │
├──────────────────────────────────┬────────────────────┤
│ MAIN AREA                        │ RIGHT PANEL        │
│ (flex grow, min ~700 px wide)    │ (~300 px wide)     │
│                                  │                    │
│  ┌────────────────────────────┐  │  Default state:    │
│  │ PROBLEM (glass card)       │  │  Help · keyword    │
│  │   "Il drago ha 5 monete…"  │  │  reference         │
│  └────────────────────────────┘  │  (collapsible      │
│                                  │   categories)      │
│  ┌────────────────────────────┐  │                    │
│  │ EDITOR (CodeMirror)        │  │  Execution state:  │
│  │                            │  │  Output + Vars     │
│  │                            │  │  (live snapshot)   │
│  └────────────────────────────┘  │                    │
│  [❓ Aiuto]  ──flex──  [▶ ESEGUI] │                    │
├──────────────────────────────────┴────────────────────┤
│ BOTTOM BAR  (~56 px)                                   │
│ 10-node horizontal map — completed · current · locked  │
└───────────────────────────────────────────────────────┘
```

### Pane responsibilities

| Pane | Default state | Execution state |
|---|---|---|
| Top bar | Logo, level indicator, stars count, settings icon | Same; no change |
| Main · Problem card | Static problem narrative + expected output | Same; no change |
| Main · Editor | CodeMirror editable | CodeMirror read-only with line highlight |
| Main · Buttons | `❓ Aiuto` ghost + `▶ ESEGUI` primary | Both disabled; primary becomes `▶ Eseguendo…` |
| Right panel | Help / language reference (collapsible by category) | Output (top half) + Variables (bottom half) |
| Bottom bar | 10-node strip; current node pulses amber | Current node pulses brighter; rest unchanged |

### The right-panel crossfade

When `▶ ESEGUI` is pressed:

1. Help content fades to opacity 0 over 300 ms
2. Output+Variables content fades in over 300 ms (offset 200 ms, slight overlap)
3. The pane background remains continuous — no width/height change, no border flash

When execution completes:

1. If output is correct: branch popup opens (covers the workspace); right panel stays in Output+Variables mode behind it
2. After the player picks a branch: popup closes, problem regenerates, right panel crossfades back to Help

### Bottom-bar map

The map is a horizontal strip showing all 10 levels as circles connected by hairline dashed lines. Three node states:

- **Completed**: gradient purple→pink circle (22 px) with the chosen-element emoji; soft glow
- **Current**: gradient amber→orange circle (27 px, slightly larger) with the level number; pulsing glow
- **Locked**: translucent white circle (22 px) with the level number; no glow

The bar height does **not** grow when branches appear (no fan-up). Branch choice is handled by the floating popup instead.

### Floating popup (branch choice + success)

After a level is completed:

- The workspace dims and blurs (backdrop-filter blur, 60% opacity scrim)
- A centered glass card appears with:
  - 🎉 celebration glyph
  - Star rating (1–3 ⭐)
  - AI explanation (one sentence)
  - Narrative bridge (2–3 sentences)
  - 2–4 branch element cards (each: emoji + name)
- Player clicks a branch card → popup closes, level advances, next problem loads in the workspace
- **No dismiss/cancel** — the player must pick. The popup is committal, framing the choice as a celebratory moment.

This collapses three previously distinct moments (success screen → map screen → branch click) into one.

### Modal patterns

Modals are large glass cards centered over a blurred workspace. All modals share the same:
- Backdrop: workspace dimmed + `backdrop-filter: blur(8px)` scrim
- Container: `var(--glass-elevated)` fill, `var(--glass-border)` hairline, `var(--shadow-glass)` shadow, 16 px corner radius
- Width: max 560 px (single column content)
- Close: ✕ button top-right (settings), Escape key, or backdrop click (where appropriate)

Modal inventory:

| Modal | When | Closable |
|---|---|---|
| Welcome + Story Input | First launch, or after Clear Progress | No close — must submit a story |
| Map generation in progress | After story submitted, while `generateMap` runs | No close — wait for resolution |
| Map generation error | If `generateMap` fails | Retry / Open Settings buttons |
| Settings | Gear icon | ✕ / Escape / backdrop click |
| Branch + success popup | After level completed | No close — must pick a branch |
| Wrong output explanation | After incorrect submission | Try Again button |
| Game complete (level 10) | After level 10 completed | Restart (clears progress, opens story modal) / Close (returns to workspace showing completed map, no current node) |

Inline (non-modal) error states:

| Error | Where | Form |
|---|---|---|
| Parse error | Below editor | Small glass card with child-friendly message + line number |
| Runtime error | Below editor | Small glass card with line number + message |

## Visual system

### Aurora background

A fixed, full-bleed background on `<body>`:

```css
background:
  radial-gradient(at 15% 20%, rgba(167, 139, 250, 0.42) 0%, transparent 40%),
  radial-gradient(at 85% 80%, rgba(244, 114, 182, 0.38) 0%, transparent 45%),
  radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.28) 0%, transparent 55%),
  linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%);
background-attachment: fixed;
```

The radial highlights sit on a deep indigo→violet→magenta base. Glass surfaces above the background pick up these tints by refraction (backdrop-filter), giving each pane a slightly different chroma without needing explicit per-pane color.

An optional subtle drift animation (~40 s loop, very low amplitude) breathes life into the gradient. Disabled when `prefers-reduced-motion: reduce`.

### Glass tokens

```css
--glass-surface:  rgba(255, 255, 255, 0.07);  /* default pane fill */
--glass-elevated: rgba(255, 255, 255, 0.12);  /* popups, modals */
--glass-border:   rgba(255, 255, 255, 0.16);  /* hairline */
--glass-blur:     blur(28px) saturate(160%);
--shadow-glass:   0 12px 40px rgba(0, 0, 0, 0.30);
```

Applied to every pane and modal. The `saturate(160%)` boost keeps the underlying aurora colors vivid through the blur — without it, glass surfaces flatten to gray.

### Color tokens

```css
/* Backgrounds */
--bg-deep:    #1e1b4b;
--bg-mid:     #4c1d95;
--bg-accent:  #831843;

/* Text */
--text-primary:   #f8fafc;                    /* body text */
--text-secondary: rgba(248, 250, 252, 0.72);  /* subdued */
--text-tertiary:  rgba(248, 250, 252, 0.45);  /* dim, line numbers */

/* Accents (strict roles) */
--accent-purple:  #c084fc;  /* primary actions, completed nodes */
--accent-pink:    #f0abfc;  /* labels, headings, problem markers */
--accent-amber:   #fde047;  /* stars, current node */
--accent-success: #6ee7b7;  /* execution success only */
--accent-error:   #fda4af;  /* errors only — soft rose, not screaming red */
```

The previous brand purple `#9333ea` is **retired** in favor of `#c084fc`, which reads more cleanly on dark glass.

Strict role assignments mean: green is **only** for execution success, rose is **only** for errors, amber is **only** for stars and the current map node. This eliminates the "too many colors" problem.

### Editor syntax colors

CodeMirror syntax highlighting is **separate from the chrome palette**. The editor canvas has its own dark background and uses syntax colors tuned for code legibility:

- Keywords: `#93c5fd` (light blue) — already in spec
- Numbers: `var(--accent-amber)`
- Strings: `var(--accent-success)`
- Identifiers: `var(--accent-pink)`
- Operators: `var(--text-secondary)`

This shares the chrome palette for warmth without color sprawl.

### Typography

Two web fonts, both loaded via Google Fonts with `display: swap`:

- **Lexend** (UI) — weights 400, 500, 600, 700, 800. Chosen for legibility (designed for reading proficiency, suitable for children) with distinctive shapes (angled crossbars, gentle curves) that add personality without becoming twee.
- **JetBrains Mono** (code) — weights 400, 500, 600. Chosen for code legibility, no ambiguous characters, strong rhythm on Italian keywords (SCRIVI, RIPETI, VOLTE).

Typography scale:

| Role | Size | Weight | Treatment |
|---|---|---|---|
| Display | 28-32 px | 800 | tight letter-spacing |
| Heading | 19-22 px | 700 | default |
| Body | 14-16 px | 400-500 | line-height 1.45-1.5 |
| Label | 11 px | 700 | UPPERCASE, letter-spacing 0.9 px |
| Code | 14 px | 500 | JetBrains Mono |

The Label treatment is the "small caps" effect: short uppercase strings with letter-spacing as section markers throughout the UI.

### Spacing & radius

| Token | Value | Use |
|---|---|---|
| Pane padding | 16 px | Inside glass panes |
| Pane gap | 14 px | Between panes in the workspace grid |
| Pane radius | 14 px | All panes |
| Button radius | 11 px | All buttons |
| Modal radius | 16 px | All modals |
| Help card radius | 9 px | Keyword reference cards |

### Buttons

Two button styles only:

- **Primary** — `linear-gradient(135deg, --accent-purple, --accent-pink)` background, white text, `box-shadow: 0 6px 22px rgba(192, 132, 252, 0.5)`. Used for the single primary action on each surface (RUN, Start Adventure, Test & Save).
- **Ghost** — `rgba(255, 255, 255, 0.10)` background, `--text-primary` text, `--glass-border` hairline. Used for everything else (Help, Cancel, Close).

No third button variant. Replaces the previous primary/secondary/success/warning palette.

## Surface inventory

The full list of surfaces the implementation must build:

### Workspace (always-on)

1. `<TopBar>` — logo, level indicator, stars total, settings icon
2. `<ProblemCard>` — problem narrative + expected output indicator
3. `<EditorPane>` — CodeMirror with line highlighting, inline error cards below
4. `<RunControls>` — Help button + Run button
5. `<RightPanel>` — host for `<HelpPanel>` or `<ExecutionPanel>` (crossfade)
6. `<HelpPanel>` — collapsible categories: Print · Math · Loops · Conditions; each with keyword glass cards
7. `<ExecutionPanel>` — Output (`<OutputPanel>`) + Variables (`<VariablesPanel>`) stacked
8. `<MapBar>` — 10-node horizontal strip with pulse on current

### Modals

9. `<WelcomeStoryModal>` — title + textarea + example chips + "Give me ideas" + Start
10. `<GeneratingMapModal>` — shimmer indicator on map bar + dimmed workspace (no centered modal needed; the shimmer IS the indicator)
11. `<MapErrorModal>` — error message + Retry / Open Settings
12. `<SettingsModal>` — API key input + language toggle + Clear Progress
13. `<BranchSuccessPopup>` — stars + explanation + narrative bridge + 2-4 branch cards
14. `<WrongOutputModal>` — AI explanation + Try Again
15. `<GameCompleteModal>` — celebration + summary + Restart

### Inline error cards (within editor pane)

16. `<ParseErrorCard>` — child-friendly parse error message
17. `<RuntimeErrorCard>` — child-friendly runtime error message

## Behavior changes from current

| Concept | Before | After |
|---|---|---|
| Number of screens | 8+ distinct screens with router-like state machine | 1 workspace + modals/popups |
| Welcome screen | Standalone | Folded into first-launch story modal |
| Story input | Standalone | Folded into first-launch story modal |
| Generating | Standalone full-screen | Shimmer indicator on map bar + dimmed workspace |
| Map | Standalone winding-path SVG | Horizontal strip at bottom of workspace |
| Editor | Standalone | Center of workspace (always present) |
| Executing | Standalone with animator | State change of workspace (right panel swap, editor freeze) |
| Success | Standalone full-screen with stars | Popup over workspace, combined with branch choice |
| Branch choice | Click on map node | Cards inside success popup |
| Error display | Inline below editor with retry/help | Same (inline below editor); restyled as glass card |
| Settings | Standalone screen | Modal over workspace |
| Map error | Standalone screen | Modal over workspace |

## Mobile / tablet

**Not supported.** On viewports narrower than 900 px, the workspace cannot render its four-pane layout legibly. The app shows a single glass card:

> "Codino is designed for a desktop or laptop browser. Please use a wider screen to start coding." (with bilingual variants)

A small animated Codino mark provides brand presence. No degraded layout is offered — half-working desktop layouts hurt the perception of polish more than a clean "please use desktop" message.

## Accessibility

- All text colors meet WCAG AA contrast against the glass surfaces (verified with the deepest aurora region as background reference)
- `prefers-reduced-motion: reduce` disables aurora drift, replaces crossfades with instant swaps, and stops the current-node pulse
- All modal close buttons have `aria-label`s tied to the language toggle (`Chiudi` / `Close`)
- The branch popup is `role="dialog" aria-modal="true"`; the branch cards are properly focusable buttons
- Editor line highlighting uses both color and a left-border indicator so it works for color-vision-deficient players

## Out of scope

The redesign explicitly does **not** change:

- Parser, interpreter, or grammar (the `codino-language` capability is untouched)
- API integration with Claude (the `ai-integration` capability is untouched)
- Store contracts, persistence semantics, the `codino_progress` / `codino_settings` / `codino_current_level` schema (the `game-state` capability is untouched)
- Animation pacing (1500 ms per execution step stays)
- Bilingual support (every new string gets an Italian + English variant)
- Mobile or tablet support (still out of scope)

## Capability specs to update after implementation

Once this redesign ships, the following capability specs must be updated to reflect the new state:

- `specs/map-visualization.md` — replace SVG winding-path decisions with horizontal strip; remove branch-node fan layout (now part of the popup)
- `specs/editor.md` — update on workspace embedding; add `<HelpPanel>` and execution-panel crossfade decisions
- `specs/story-onboarding.md` — collapse three screen states into the single first-launch modal pattern
- `specs/execution-engine.md` — update the screen-transition decisions to reflect in-place state changes
- `specs/settings.md` — update the modal styling pattern
- `specs/project.md` — note the dependency on Google Fonts (Lexend, JetBrains Mono)

A new capability spec `specs/visual-system.md` is recommended to capture the shared color/glass/typography tokens — these now span multiple capability areas and deserve a single home.

## Open implementation decisions

These details are deferred to the implementation plan and don't need pre-implementation validation:

- Exact crossfade animation curves
- Help panel default-expanded category by current level concept (Level 1-2 = Print, Level 3-4 = Math, Level 5-6 = Loops, Level 7-9 = Conditions, Level 10 = all collapsed)
- Whether the aurora drift animation is on by default or opt-in
- Whether keyboard shortcuts (Cmd+Enter to run, Cmd+, to settings) are introduced
- Whether the celebration popup auto-advances after a few seconds or waits for click
- Glass tinting variations between modal types (welcome vs settings vs popup)

## References

This design was assembled through visual brainstorming on 2026-06-06. Mockup artifacts (workspace layouts, branch fan vs popup comparison, Aurora vs Crystalline vs Tinted, font comparison) live in `.superpowers/brainstorm/` if needed for reference — that directory is gitignored, so the mockups are local-only.
