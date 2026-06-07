# Map visualization

The map is a horizontal strip at the bottom of the workspace showing the player's progress through 10 levels. It is a status indicator, not a navigation control — branch selection happens via the BranchSuccessPopup, not by clicking nodes.

## Decisions

### Horizontal strip in the workspace BottomBar
The map is rendered as 10 nodes connected by hairline lines spread across the full bottom bar width. Each node is ~22 px (current node 27 px), with the chosen-element emoji for completed levels.

### Three node states, all visually distinct
- **Completed**: gradient purple→pink circle with the chosen emoji; soft purple glow
- **Current**: gradient amber→orange circle; amber glow; slightly larger. Shows the level number, except node 1 which shows the `startEmoji` when available (see below)
- **Locked**: translucent white circle with the level number; no glow

The current node is defined as the level currently being played (`currentLevel` from the store, when not in `completedLevels`).

### Node 1 shows a story-derived startEmoji
`generateMap` returns a `startEmoji` alongside the level structure — one emoji chosen by the AI to represent the story's opening scene (e.g. 🐉 for a dragon story, 🚀 for space, 🧙 for magic). This emoji is shown on node 1 when it is the current amber node, replacing the plain "1". It is persisted in `mapStartEmoji` in progress storage.

No initial element pick is required. The `startEmoji` is purely visual — it represents where the story begins, not a chosen branch element. The first actual element choice happens via BranchSuccessPopup after completing level 1.
> Alternatives considered: (A) omit node 1 — breaks visual consistency; (B) fixed number — not playful; (C) fixed generic emoji — works but generic for every player; (D) dynamic startEmoji from generateMap — personalised, free (same API call), chosen.

### Map is NOT clickable
Branch selection happens via the BranchSuccessPopup that appears after a level is completed. The map nodes themselves have no `onClick` handlers. This is a deliberate change from the original design where map nodes were the navigation primary.
> Alternatives considered: Fan-up from the frontier slot (branch cards too small for children; bottom bar grew 50→95 px when active). Fan-down below the map (awkward, mixed direction signals). Popup chosen because branches are large, bar stays compact, and the choice is framed as a celebratory moment.

### Data sources from the store
`completedLevels`, `currentLevel`, `chosenElements`, and `mapStartEmoji` are all read from `useGameStore`. The component is pure presentation with no local state.

## Invariants

INV-01: Exactly 10 nodes are rendered, one per level.

INV-02: The chosen-element emoji on a completed node comes from `chosenElements[levelIndex]` (zero-based index).

INV-03: At most one node has the 'current' state at any time.

INV-04: The map is not interactive. No node has `onClick`, `cursor: pointer`, or any click affordance.

INV-05: Level 10 locked node shows 🏁 instead of the level number.

INV-06: Node 1 in current state shows `mapStartEmoji` when it is non-empty, otherwise falls back to "1".
