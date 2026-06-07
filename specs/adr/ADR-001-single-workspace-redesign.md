# ADR-001: Single-workspace, glass-aesthetic UI redesign

## Status

Accepted · 2026-06-06

## Context

The original Codino UI grew component-by-component without a unifying visual system. Three problems emerged in testing:

1. **No coherent aesthetic.** Seven distinct UI colors (purple, blue, green, yellow, pink, red, gray) competed for attention with no clear role assignment. The app read as a utility, not a children's narrative game.
2. **Fragmented play loop.** A single play session jumped across 8+ separate screens (welcome → story → generating → map → editor → executing → success → map → editor). Each transition had its own layout and loading state; the mental model was disjointed.
3. **Underused desktop real estate.** The editor screen had only two panes (problem + editor) on a desktop browser. Auxiliary information — current level, stars earned, language reference, progress through the adventure — lived on screens the player had navigated away from.

The design goal of being a "story adventure" was undermined by the utility-app feel.

## Decision

Six interlocking decisions, captured here as a single architectural shift. Implementation details (color values, exact pane widths, surface inventory) live in the accompanying redesign doc; this ADR captures the durable direction.

1. **Consolidate the play loop into a single always-on workspace.** Four panes: top bar (status), main (problem + editor), right panel (help / output crossfade), bottom strip (map). Previously separate screens become modals or popups over this workspace; the map screen is eliminated entirely.
2. **Adopt the Aurora visual system.** A multi-radial gradient background (indigo → violet → magenta) carries chromatic personality; surfaces above use glass with `backdrop-filter` blur and saturation boost, picking up tints from the background by refraction rather than by paint.
3. **Establish a disciplined accent palette.** Each accent color has a strict role: purple = primary actions and completed nodes, pink = labels and headings, amber = stars and current node, green = execution success, rose = errors. No "general purpose" colors that drift between roles.
4. **Adopt Lexend (UI) + JetBrains Mono (code) as the official typography.** Lexend chosen for legibility-with-personality; small-caps treatment (uppercase + letter-spacing) becomes the visual rhythm for section markers throughout the UI.
5. **Combine success and branch-choice into one floating popup.** After a level completes, a glass card appears with stars, narrative bridge, and 2–4 branch element cards. The player must pick to continue (no cancel). This collapses three previously-distinct moments — success screen, map view, branch click — into one celebratory moment.
6. **Desktop-only.** Viewports < 900 px show a "please use a desktop" card. Coding requires a keyboard, and a half-working tablet layout hurts perceived polish more than a clean refusal.

## Rejected alternatives

### Visual style

- **Crystalline** (deep slate + purple-only accent) — disciplined but too neutral. The "Apple Pro app" feel didn't fit the children's narrative game.
- **Tinted vibrance** (each functional pane has its own hue) — risk of becoming visually busy when all panes are at saturation. Letting the background carry chromatic personality is more defensible than per-pane paint.

### Layout

- **Three-column IDE** (map left, editor center, help right) — split player attention three ways; the map taking a left column ate space better used for the editor.
- **Two-column with top status bar** (without the bottom strip) — better than IDE but had no natural home for the 10-node map. The horizontal strip at the bottom solves this because 10 nodes spread across ~1000 px is ~100 px per node, plenty of room.
- **No reorganization** (keep multi-screen flow, just restyle) — would have left the fragmentation problem unsolved.

### Branch-choice mechanism

- **Fan-up from the frontier slot** — branch cards too small for 7–8 year olds (16 px emoji vs 22 px in popup); forced the bottom bar to grow from 50 → 95 px when active, eating vertical workspace.
- **Fan-down below the map line** — visually awkward, mixed direction signals.
- **Popup** (chosen) — branches are large, the bottom bar stays compact, and the choice is properly framed as a celebratory moment.

### Typography

- **Inter / Geist** — too neutral; would have read as a developer dashboard against the dreamy aurora background.
- **Plus Jakarta Sans** — strong contender, considered the lead pick before final review; rejected in favor of Lexend because its proportions felt close to "cleaner Arial" while Lexend has more distinctive shapes (angled crossbars, gentle curves) that add personality without becoming twee.
- **Nunito / Quicksand** — too rounded; tipped into "cute kids app" territory that clashes with the precision of the glass aesthetic.
- **DM Sans** — acceptable mid-ground but less distinctive than Lexend.

### Mobile / tablet support

- **Responsive layout for tablets** — half-working desktop layouts would degrade perception of polish more than a clean "please use desktop" message. Coding requires a physical keyboard anyway.

## Consequences

- Five capability specs need updating once the redesign ships: `map-visualization`, `editor`, `story-onboarding`, `execution-engine`, `settings`. The `codino-language`, `ai-integration`, and `game-state` capabilities are explicitly **unaffected** — parser/interpreter, API client, and store contracts remain as-is.
- A new capability spec `visual-system.md` should be introduced to home the shared color/glass/typography tokens, since these now span multiple capability areas.
- Two new web font dependencies (Lexend, JetBrains Mono via Google Fonts, ~40 KB WOFF2). `project.md` will need updating to note this.
- The retired brand purple `#9333ea` (which the user kept across the Tailwind upgrade) is replaced by `#c084fc`. This is the last visible mention of the old brand color; any commentary referencing it elsewhere should be updated.

## References

- Implementation companion (archived — shipped): was `specs/redesigns/2026-06-06-aurora-redesign.md`; decisions now live in the capability specs
- Brainstorming mockups (local-only, gitignored): `.superpowers/brainstorm/`
