# Map visualization

The map is a horizontal strip at the bottom of the workspace showing the player's progress through 10 levels. It is a status indicator, not a navigation control — branch selection happens via the BranchSuccessPopup, not by clicking nodes.

## Decisions

### Horizontal strip in the workspace BottomBar
The map is rendered as 10 nodes connected by hairline lines spread across the full bottom bar width. Each node is ~22 px (current node 27 px), with the chosen-element emoji for completed levels.

### Three node states, all visually distinct
- **Completed**: gradient purple→pink circle with the chosen emoji; soft purple glow
- **Current**: gradient amber→orange circle; amber glow; slightly larger. Shows the defining emoji when one exists (see INV-02), otherwise the level number
- **Locked**: translucent white circle with the level number; no glow

The current node is defined as the level currently being played (`currentLevel` from the store, when not in `completedLevels`).

### Node emoji assignment: one emoji per level, derived from what defines that level
Each level has a "defining emoji" — the emoji the player associates with it:
- Level 1: `startEmoji` from `generateMap` (a story-derived emoji like 🐉, 🚀, 🧙; no element is chosen before level 1)
- Level N (N ≥ 2): `chosenElements[N-2]` — the branch element chosen after completing level N-1, which shapes level N's problem

This emoji appears on the node in both **completed** and **current** states. On a completed node it shows what that level was about; on the current node it reminds the player which element they are playing with now.

`generateMap` returns `startEmoji` alongside the level structure. It is persisted in `mapStartEmoji` in progress storage.
> Alternatives considered for node 1: (A) omit node — breaks visual consistency; (B) fixed number — not playful; (C) fixed generic emoji — generic for every player; (D) dynamic startEmoji from generateMap — personalised, free (same API call), chosen.

### Map is NOT clickable
Branch selection happens via the BranchSuccessPopup that appears after a level is completed. The map nodes themselves have no `onClick` handlers. This is a deliberate change from the original design where map nodes were the navigation primary.
> Alternatives considered: Fan-up from the frontier slot (branch cards too small for children; bottom bar grew 50→95 px when active). Fan-down below the map (awkward, mixed direction signals). Popup chosen because branches are large, bar stays compact, and the choice is framed as a celebratory moment.

### Data sources from the store
`completedLevels`, `currentLevel`, `chosenElements`, and `mapStartEmoji` are all read from `useGameStore`. The component is pure presentation with no local state.

## Invariants

INV-01: Exactly 10 nodes are rendered, one per level.

INV-02: The defining emoji for level N is: `startEmoji` for N=1; `chosenElements[N-2]` for N≥2. This emoji is shown on both completed and current nodes; falls back to the level number when absent.

INV-03: At most one node has the 'current' state at any time.

INV-04: The map is not interactive. No node has `onClick`, `cursor: pointer`, or any click affordance.

INV-05: Level 10 locked node shows 🏁 instead of the level number.

INV-06: `mapStartEmoji` is set by `generateMap` and persisted in progress storage; it is the defining emoji for level 1 in both completed and current states.
