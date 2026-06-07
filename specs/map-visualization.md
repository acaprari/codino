# Map visualization

The map is a horizontal strip at the bottom of the workspace showing the player's progress through 10 levels. It is a status indicator, not a navigation control — branch selection happens via the BranchSuccessPopup, not by clicking nodes.

## Decisions

### Horizontal strip in the workspace BottomBar
The map is rendered as 10 nodes connected by hairline lines spread across the full bottom bar width. Each node is ~22 px (current node 27 px), with the chosen-element emoji for completed levels.

### Three node states, all visually distinct
- **Completed**: gradient purple→pink circle with the chosen emoji; soft purple glow
- **Current**: gradient amber→orange circle with the level number; amber glow; slightly larger (27 px)
- **Locked**: translucent white circle with the level number; no glow

The current node is defined as the level currently being played (`currentLevel` from the store, when not in `completedLevels`).

### Map is NOT clickable
Branch selection happens via the BranchSuccessPopup that appears after a level is completed. The map nodes themselves have no `onClick` handlers. This is a deliberate change from the original design where map nodes were the navigation primary.
> Alternatives considered: Fan-up from the frontier slot (branch cards too small for children; bottom bar grew 50→95 px when active). Fan-down below the map (awkward, mixed direction signals). Popup chosen because branches are large, bar stays compact, and the choice is framed as a celebratory moment.

### Data sources from the store
`completedLevels`, `currentLevel`, and `chosenElements` are all read from `useGameStore`. The component is pure presentation with no local state.

## Invariants

INV-01: Exactly 10 nodes are rendered, one per level.

INV-02: The chosen-element emoji on a completed node comes from `chosenElements[levelIndex]` (zero-based index).

INV-03: At most one node has the 'current' state at any time.

INV-04: The map is not interactive. No node has `onClick`, `cursor: pointer`, or any click affordance.

INV-05: Level 10 locked node shows 🏁 instead of the level number.
