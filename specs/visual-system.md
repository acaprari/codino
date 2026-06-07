# Visual system

The shared visual language for every Codino surface: background, glass, color, typography, geometry. Lives globally in `src/styles/aurora.css` as CSS custom properties consumed by components via inline styles.

## Decisions

### Aurora background lives on `<body>`
A multi-radial gradient (indigo → violet → pink → magenta) attached to `<body>` via the `.aurora-mode` class. `background-attachment: fixed` keeps it stationary while content scrolls. The aurora-mode class is set unconditionally in `src/main.tsx`.

### Glass surfaces use `backdrop-filter`
Every pane and modal uses `backdrop-filter: blur(28px) saturate(160%)` over a translucent white fill. The saturation boost preserves the underlying gradient through the blur. Two intensity levels:
- `--aurora-glass-surface` (0.07 alpha) for inline panes
- `--aurora-glass-elevated` (0.12 alpha) for floating overlays

### Strict accent role assignments
Each accent color owns one and only one role. This is the discipline that prevents the "too many colors" problem:

| Token | Single role |
|---|---|
| `--aurora-accent-purple` (`#c084fc`) | Primary actions, completed map nodes |
| `--aurora-accent-pink` (`#f0abfc`) | Labels, headings, problem markers |
| `--aurora-accent-amber` (`#fde047`) | Stars, current map node |
| `--aurora-accent-success` (`#6ee7b7`) | Execution output only |
| `--aurora-accent-error` (`#fda4af`) | Error states only |

### Lexend (UI) + JetBrains Mono (code)
Loaded from Google Fonts via a `<link>` in `index.html` with `display=swap`. Both are open-source. Lexend was chosen for legibility-with-personality (designed for reading proficiency, with distinctive letterforms that feel playful without being twee). JetBrains Mono for code because it disambiguates 0/O/1/l/I and renders Codino keywords with strong rhythm.
> Alternatives considered: Inter/Geist (too neutral, read as developer dashboards), Plus Jakarta Sans (strong contender but felt like a cleaner Arial), Nunito/Quicksand (too rounded, clashed with glass aesthetic), DM Sans (acceptable but less distinctive than Lexend).

### Label = small-caps treatment
Section markers throughout the UI use a single Label component: 11 px, weight 700, uppercase, letter-spacing 0.9 px, `--aurora-accent-pink` color. This visual rhythm ties the whole UI together.

### Two button variants only
- Primary: purple→pink gradient. Used for the single highest-affordance action on each surface.
- Ghost: translucent with hairline border. Used for everything else.

There is no third variant. This replaces the previous primary/secondary/success/warning button palette.

## Invariants

INV-01: All Codino UI components must source colors via `var(--aurora-*)` custom properties. Hard-coded hex values outside `aurora.css` violate the discipline.

INV-02: Each accent color appears in only its assigned role. Reusing `--aurora-accent-success` for non-output green is forbidden.

INV-03: Every pane and modal uses one of the two glass intensities (`--aurora-glass-surface` or `--aurora-glass-elevated`); no bespoke fills.

INV-04: All button surfaces use the `AuroraButton` component. Icon-only controls (close ✕, gear ⚙️) are the only acceptable exception.

INV-05: All section markers use the `Label` component. Inline elements that duplicate the small-caps treatment violate INV-05.

INV-06: The Aurora gradient is applied unconditionally via `body.aurora-mode` set in `src/main.tsx`.
