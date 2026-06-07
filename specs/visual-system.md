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

### `AuroraModal` primitive
`AuroraModal` is the shared modal primitive used by every modal in the app (`WelcomeStoryModal`, `SettingsModal`, `MapErrorModal`, `WrongOutputModal`, `BranchSuccessPopup`, `GameCompleteModal`). It owns the overlay, the elevated-glass container, and optional dismissibility. It does **not** own any close affordance — consumers add their own ✕ where they want one.

API:
- `open: boolean` — when `false`, renders nothing.
- `onClose: () => void` — called by the dismissibility wiring; consumers also call it from their own close affordances.
- `dismissible?: boolean` — defaults to `false`. When `true`, the primitive wires Escape (via a window `keydown` listener) and backdrop click to `onClose`. When `false`, neither fires; the consumer must provide an explicit exit.
- `maxWidth?: number` — defaults to `560` (pixels).

The content `<div>` calls `e.stopPropagation()` so clicking inside the modal does not bubble up to the backdrop's `onClose`. The overlay always renders with `role="dialog"` and `aria-modal="true"`.

Each consumer modal sets its own `dismissible` value — they are documented in their respective capability specs ([[story-onboarding]], [[execution-engine]], [[map-visualization]], [[settings]]) so the dismissibility contract is visible per modal, not just at the primitive.

### Desktop-only guard at 900 px
`DesktopOnlyGuard` wraps the app and short-circuits to a fallback card when `window.innerWidth < 900`. The threshold is a single module-level constant `MIN_WIDTH = 900`. A resize listener updates the width on every viewport change so the guard activates and deactivates live. The fallback card uses the elevated glass surface (per INV-03), contains a 💻 emoji header, and renders bilingual title + body strings. ADR-001 carries the rationale: coding requires a physical keyboard, and a half-working tablet layout would hurt perceived polish more than a clean refusal.
> The 900 px cutoff was picked because it cleanly excludes tablets in portrait while leaving room for typical laptop widths. The threshold is not load-bearing — moving it by 50–100 px would not change which devices are blocked.

## Invariants

INV-01: All Codino UI components must source colors via `var(--aurora-*)` custom properties. Hard-coded hex values outside `aurora.css` violate the discipline.

INV-02: Each accent color appears in only its assigned role. Reusing `--aurora-accent-success` for non-output green is forbidden.

INV-03: Every pane and modal uses one of the two glass intensities (`--aurora-glass-surface` or `--aurora-glass-elevated`); no bespoke fills.

INV-04: All button surfaces use the `AuroraButton` component. Icon-only controls (close ✕, gear ⚙️) are the only acceptable exception.

INV-05: All section markers use the `Label` component. Inline elements that duplicate the small-caps treatment violate INV-05.

INV-06: The Aurora gradient is applied unconditionally via `body.aurora-mode` set in `src/main.tsx`.

INV-07: `DesktopOnlyGuard` short-circuits the app render when `window.innerWidth < 900`, replacing children with the elevated-glass fallback card. The threshold lives in a single `MIN_WIDTH` constant in `DesktopOnlyGuard.tsx`. A `resize` event listener keeps the guard live; entering or leaving the threshold during a session flips the rendered tree without reload.

INV-08: `AuroraModal.dismissible` defaults to `false`. When `false`, neither Escape nor backdrop click invoke `onClose` — the consumer must wire its own exit. When `true`, both are wired via the primitive.

INV-09: `AuroraModal` does not render any close affordance (no ✕ button, no "Close" link). Consumer modals add their own when needed. The primitive only owns the overlay, the glass container, the dismissibility wiring, and the `role="dialog"`/`aria-modal="true"` attributes.
