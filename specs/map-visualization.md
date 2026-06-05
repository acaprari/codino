# Map Visualization

The map shows the player's progress through 10 levels on a winding SVG path. It is the game's home screen between levels — the place where the player chooses the next story element and sees how far they have come.

## Decisions

### Winding sine-wave path layout
`useMapLayout` calculates 10 spine positions along a sine-wave curve (`y = 300 + sin(progress × π × 3) × 120`). Adjacent positions are connected with cubic Bézier curves. The path is drawn as a single SVG `<path>` element. The layout is deterministic (no randomness) and computed once via `useMemo`.

### Branches ARE the element choices — clicking a branch starts the next level
The map never shows a "next level" node to click. Instead, at the frontier (the position of the next level to start), 2–4 branch nodes fan out perpendicular to the path direction. Each branch shows the element's emoji and name. Clicking a branch selects that element, increments `currentLevel`, and navigates to the editor. This is the design's stated approach: one interaction (click branch) = choose element + start level.

### Branch layout: perpendicular fan from the last completed position
Given the frontier spine position and the direction from the previous completed position, the branch nodes are spread perpendicular to the path. The spacing between branches is 90 px (2 branches), 80 px (3 branches), or 70 px (4 branches). Connector lines run from the last completed node (or a synthetic start point for level 1) to each branch node.

### `mapStructure: LevelStructure[]` is the canonical branch data
`LevelStructure { level, branches: Element[] }` is the raw AI output from `generateMap`. The store holds this as-is; the map reads `mapStructure[completedCount]?.branches` to determine which branches to display at the frontier. If `mapStructure` is empty (generation pending or failed), a "Generating map…" message is shown and no branches are rendered.

### Three spine node states: completed, locked, invisible frontier
- **Completed** (green, `#4ade80`) — level is in `completedLevels`; shows the chosen element emoji
- **Locked** (gray, `#e5e7eb`) — future level beyond the frontier; shows 🔒; not clickable
- **Frontier** — the frontier spine position is NOT rendered as a node; the branch nodes replace it visually

### Only branch nodes are clickable; spine nodes are never directly interactive
All direct interactivity is through branch nodes. Completed and locked spine nodes are display-only.

### `MapView` is a pure display component driven by the store
`MapView` reads `completedLevels`, `currentLevel`, `chosenElements`, and `mapStructure` from `useGameStore` directly. It receives only `onBranchClick: (element: Element) => void` as a prop.

## Invariants

INV-01: Exactly 10 spine nodes are computed, one per level.

INV-02: Branch nodes are shown only at the frontier (`idx === completedCount`). No branches are shown at completed or locked positions.

INV-03: The frontier spine node is omitted from the SVG when branch nodes are present; clicking anywhere other than a branch node does nothing.

INV-04: `onBranchClick` receives the actual `Element` from `mapStructure` — never a hardcoded placeholder.

INV-05: The emoji shown on a completed spine node comes from `chosenElements[levelIndex]` — the element the player chose when that level was started.

INV-06: When `mapStructure` is empty (length 0), no branches are rendered and a "Generating map…" label is displayed.
