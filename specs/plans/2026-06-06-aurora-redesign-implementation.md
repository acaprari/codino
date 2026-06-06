# Aurora Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Aurora redesign — a single-workspace UI with glass aesthetic, disciplined color palette, and Lexend typography — replacing the multi-screen layout per ADR-001.

**Architecture:** Build all new components in parallel directories (`src/components/aurora/`, `src/features/aurora/`) without touching the existing code. Once everything works behind a `?ui=aurora` feature flag, cut over in App.tsx, then delete the old code. Each phase produces a working app; tests pass at every commit.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind 4 + CSS custom properties (design tokens) + Google Fonts (Lexend, JetBrains Mono) + CodeMirror 6 + Vitest + Playwright. No new dependencies.

**Source design docs:**
- [ADR-001](../adr/ADR-001-single-workspace-redesign.md) — the architectural decision
- [Aurora redesign implementation companion](../redesigns/2026-06-06-aurora-redesign.md) — surface inventory, color tokens, behavior tables

---

## File Structure

### New files (created by this plan)

```
src/
├── components/aurora/                  ← new shared primitives
│   ├── GlassPane.tsx
│   ├── AuroraButton.tsx
│   ├── AuroraModal.tsx
│   └── Label.tsx
│
├── features/aurora/                    ← new workspace + screens
│   ├── workspace/
│   │   ├── Workspace.tsx               ← root grid container
│   │   ├── TopBar.tsx
│   │   ├── MainArea.tsx
│   │   ├── ProblemCard.tsx
│   │   ├── EditorPane.tsx
│   │   ├── RunControls.tsx
│   │   ├── RightPanel.tsx              ← crossfade host
│   │   ├── HelpPanel.tsx
│   │   ├── ExecutionPanel.tsx
│   │   └── MapBar.tsx
│   ├── modals/
│   │   ├── WelcomeStoryModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── MapErrorModal.tsx
│   │   ├── WrongOutputModal.tsx
│   │   ├── GameCompleteModal.tsx
│   │   └── BranchSuccessPopup.tsx
│   ├── inline-errors/
│   │   ├── ParseErrorCard.tsx
│   │   └── RuntimeErrorCard.tsx
│   ├── DesktopOnlyGuard.tsx
│   └── AuroraApp.tsx                   ← orchestrates the workspace
│
└── styles/
    └── aurora.css                       ← design tokens, Aurora bg, base styles

tests/unit/aurora/                      ← parallel test directory
├── (mirrors components/ and features/ structure)

specs/
├── visual-system.md                    ← new capability spec (Phase K)
└── plans/2026-06-06-aurora-redesign-implementation.md  ← this file
```

### Modified files

```
index.html                              ← add Google Fonts links
src/index.css                           ← import aurora.css
src/App.tsx                             ← cutover at Phase I
specs/{map-visualization,editor,story-onboarding,execution-engine,settings,project}.md
specs/README.md                         ← index updates
package.json                            ← no changes (no new deps)
```

### Deleted files (Phase I, after cutover)

```
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Modal.tsx
src/components/layout/AppLayout.tsx
src/components/layout/Navbar.tsx
src/features/story/WelcomeScreen.tsx
src/features/story/StoryInput.tsx
src/features/story/GeneratingScreen.tsx
src/features/story/MapErrorScreen.tsx
src/features/map/MapView.tsx
src/features/map/MapNode.tsx
src/features/map/MapPath.tsx
src/features/map/MapBranch.tsx
src/features/map/useMapLayout.ts
src/features/editor/EditorView.tsx
src/features/editor/ProblemPanel.tsx
src/features/execution/ErrorDisplay.tsx
src/features/execution/ExecutionAnimator.tsx
src/features/execution/OutputPanel.tsx
src/features/execution/SuccessScreen.tsx
src/features/execution/VariablesPanel.tsx
src/features/settings/SettingsView.tsx
src/features/settings/ApiKeyInput.tsx
```

`CodeEditor.tsx`, `core/codemirror/`, `core/language/`, `core/api/`, `store/`, `types/` are **untouched** — these capabilities are not part of the redesign.

---

# Phase A — Foundation

End-of-phase state: the existing app still works exactly as before. New design tokens, fonts, and Aurora background are loaded globally and available for use by upcoming components.

## Task 1: Add Lexend and JetBrains Mono fonts

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the font links to index.html**

Edit `index.html`. After `<meta name="theme-color" content="#9333ea" />` (and before `<title>`), insert:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 2: Verify the dev server picks it up**

Run: `npm run dev` (background; ignore output)
Open `http://localhost:5173/codino/` in a browser, open DevTools → Network tab, reload, confirm two woff2 requests succeed (one for Lexend, one for JetBrains Mono).
Stop the dev server.

- [ ] **Step 3: Run existing tests**

Run: `npm test`
Expected: all tests still pass (currently 94).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(aurora): add Lexend and JetBrains Mono via Google Fonts"
```

## Task 2: Create the design-tokens stylesheet

**Files:**
- Create: `src/styles/aurora.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create aurora.css with all design tokens**

Create `src/styles/aurora.css` with this exact content:

```css
/* Aurora redesign — global design tokens (see specs/adr/ADR-001) */

:root {
  /* Background base colors */
  --aurora-bg-deep:    #1e1b4b;
  --aurora-bg-mid:     #4c1d95;
  --aurora-bg-accent:  #831843;

  /* Text colors */
  --aurora-text-primary:   #f8fafc;
  --aurora-text-secondary: rgba(248, 250, 252, 0.72);
  --aurora-text-tertiary:  rgba(248, 250, 252, 0.45);

  /* Accent colors — strict role assignments (see ADR-001) */
  --aurora-accent-purple:  #c084fc;
  --aurora-accent-pink:    #f0abfc;
  --aurora-accent-amber:   #fde047;
  --aurora-accent-success: #6ee7b7;
  --aurora-accent-error:   #fda4af;

  /* Glass surfaces */
  --aurora-glass-surface:  rgba(255, 255, 255, 0.07);
  --aurora-glass-elevated: rgba(255, 255, 255, 0.12);
  --aurora-glass-border:   rgba(255, 255, 255, 0.16);
  --aurora-glass-blur:     blur(28px) saturate(160%);
  --aurora-shadow-glass:   0 12px 40px rgba(0, 0, 0, 0.30);

  /* Editor syntax (consumed by codemirror/theme.ts in a later task) */
  --aurora-code-keyword:    #93c5fd;
  --aurora-code-number:     var(--aurora-accent-amber);
  --aurora-code-string:     var(--aurora-accent-success);
  --aurora-code-identifier: var(--aurora-accent-pink);
  --aurora-code-operator:   var(--aurora-text-secondary);

  /* Typography */
  --aurora-font-ui:   'Lexend', system-ui, sans-serif;
  --aurora-font-code: 'JetBrains Mono', ui-monospace, monospace;

  /* Geometry */
  --aurora-pane-padding: 16px;
  --aurora-pane-gap:     14px;
  --aurora-pane-radius:  14px;
  --aurora-button-radius: 11px;
  --aurora-modal-radius:  16px;
  --aurora-card-radius:    9px;
}

/* Aurora full-bleed background (applied only when .aurora-mode is on <body>) */
body.aurora-mode {
  font-family: var(--aurora-font-ui);
  color: var(--aurora-text-primary);
  background:
    radial-gradient(at 15% 20%, rgba(167, 139, 250, 0.42) 0%, transparent 40%),
    radial-gradient(at 85% 80%, rgba(244, 114, 182, 0.38) 0%, transparent 45%),
    radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.28) 0%, transparent 55%),
    linear-gradient(135deg, var(--aurora-bg-deep) 0%, var(--aurora-bg-mid) 50%, var(--aurora-bg-accent) 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

/* Reduced-motion: disable any decorative animations on aurora surfaces */
@media (prefers-reduced-motion: reduce) {
  .aurora-anim {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Import aurora.css from the main stylesheet**

Read `src/index.css` first (it currently contains Tailwind directives).

Edit `src/index.css`. Add this line at the very top (before any `@import` or `@tailwind`):

```css
@import './styles/aurora.css';
```

- [ ] **Step 3: Verify the build succeeds**

Run: `npm run build`
Expected: build completes; `dist/assets/index-*.css` is generated; no warnings about the new file.

- [ ] **Step 4: Verify tests still pass**

Run: `npm test`
Expected: 94 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/styles/aurora.css src/index.css
git commit -m "feat(aurora): add design tokens and aurora background stylesheet"
```

## Task 3: Add the `.aurora-mode` body class behind a feature flag

This activates the Aurora background only when the URL has `?ui=aurora`. The existing app stays default.

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Read the current main.tsx**

```bash
cat src/main.tsx
```

Note the exact content for the next step.

- [ ] **Step 2: Edit main.tsx to apply the feature flag**

Replace the contents of `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Aurora feature flag: ?ui=aurora applies the new design system globally.
// Once the redesign is the default, this branch becomes unconditional.
if (new URLSearchParams(window.location.search).get('ui') === 'aurora') {
  document.body.classList.add('aurora-mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

(If the existing file already has different scaffolding — e.g. ReactDOM.render vs createRoot — preserve the rest and only add the feature-flag block.)

- [ ] **Step 3: Manually verify both URLs render**

Run: `npm run dev`
- Open `http://localhost:5173/codino/` — confirm existing UI still works
- Open `http://localhost:5173/codino/?ui=aurora` — confirm the body now has the aurora gradient background visible behind the existing UI (the UI itself looks unchanged but sits on the new background)

Stop the dev server.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: 94 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx
git commit -m "feat(aurora): activate aurora-mode body class via ?ui=aurora flag"
```

---

# Phase B — Base components

End-of-phase state: four reusable primitives (`GlassPane`, `AuroraButton`, `AuroraModal`, `Label`) live in `src/components/aurora/` with unit tests. Nothing in the existing app uses them yet.

## Task 4: GlassPane component

**Files:**
- Create: `src/components/aurora/GlassPane.tsx`
- Create: `tests/unit/aurora/components/GlassPane.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/components/GlassPane.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassPane } from '../../../../src/components/aurora/GlassPane';

describe('GlassPane', () => {
  it('renders children inside a glass surface', () => {
    render(<GlassPane><span data-testid="child">hello</span></GlassPane>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses the elevated style when elevated prop is true', () => {
    const { container } = render(<GlassPane elevated>x</GlassPane>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('aurora-glass-elevated');
  });

  it('forwards className to the root element', () => {
    const { container } = render(<GlassPane className="extra-class">x</GlassPane>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('extra-class');
  });
});
```

- [ ] **Step 2: Run the test (should fail with module-not-found)**

Run: `npm test -- tests/unit/aurora/components/GlassPane.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the GlassPane component**

Create `src/components/aurora/GlassPane.tsx`:

```tsx
import type { ReactNode, CSSProperties } from 'react';

interface GlassPaneProps {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * GlassPane — the foundational glass surface. Used for every workspace
 * pane, every modal, every popup. Two intensity variants: surface (default,
 * for inline panes) and elevated (for floating overlays).
 */
export function GlassPane({ children, elevated = false, className = '', style }: GlassPaneProps) {
  const intensity = elevated ? 'aurora-glass-elevated' : 'aurora-glass-surface';
  return (
    <div
      className={`${intensity} ${className}`.trim()}
      style={{
        background: `var(--aurora-glass-${elevated ? 'elevated' : 'surface'})`,
        border: '1px solid var(--aurora-glass-border)',
        backdropFilter: 'var(--aurora-glass-blur)',
        WebkitBackdropFilter: 'var(--aurora-glass-blur)',
        borderRadius: 'var(--aurora-pane-radius)',
        padding: 'var(--aurora-pane-padding)',
        boxShadow: 'var(--aurora-shadow-glass)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/components/GlassPane.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/aurora/GlassPane.tsx tests/unit/aurora/components/GlassPane.test.tsx
git commit -m "feat(aurora): add GlassPane primitive"
```

## Task 5: AuroraButton component (replaces Button)

Two variants only: `primary` (purple-pink gradient) and `ghost` (translucent).

**Files:**
- Create: `src/components/aurora/AuroraButton.tsx`
- Create: `tests/unit/aurora/components/AuroraButton.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/components/AuroraButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuroraButton } from '../../../../src/components/aurora/AuroraButton';

describe('AuroraButton', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<AuroraButton onClick={onClick}>Run</AuroraButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<AuroraButton onClick={onClick} disabled>Run</AuroraButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies primary variant by default', () => {
    render(<AuroraButton>Run</AuroraButton>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('primary');
  });

  it('applies ghost variant when specified', () => {
    render(<AuroraButton variant="ghost">Help</AuroraButton>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('ghost');
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

Run: `npm test -- tests/unit/aurora/components/AuroraButton.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the AuroraButton component**

Create `src/components/aurora/AuroraButton.tsx`:

```tsx
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

interface AuroraButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

const baseStyle = {
  fontFamily: 'var(--aurora-font-ui)',
  fontSize: '14px',
  fontWeight: 600,
  padding: '11px 22px',
  borderRadius: 'var(--aurora-button-radius)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  border: 'none',
  transition: 'transform 0.15s, opacity 0.15s',
} as const;

const primaryStyle = {
  background: 'linear-gradient(135deg, var(--aurora-accent-purple), var(--aurora-accent-pink))',
  color: 'white',
  boxShadow: '0 6px 22px rgba(192,132,252,0.5)',
};

const ghostStyle = {
  background: 'rgba(255,255,255,0.10)',
  color: 'var(--aurora-text-primary)',
  border: '1px solid var(--aurora-glass-border)',
};

const disabledStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export function AuroraButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}: AuroraButtonProps) {
  const style = {
    ...baseStyle,
    ...(variant === 'primary' ? primaryStyle : ghostStyle),
    ...(disabled ? disabledStyle : {}),
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-variant={variant}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/components/AuroraButton.test.tsx`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/aurora/AuroraButton.tsx tests/unit/aurora/components/AuroraButton.test.tsx
git commit -m "feat(aurora): add AuroraButton with primary and ghost variants"
```

## Task 6: AuroraModal component (glass modal base)

**Files:**
- Create: `src/components/aurora/AuroraModal.tsx`
- Create: `tests/unit/aurora/components/AuroraModal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/components/AuroraModal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuroraModal } from '../../../../src/components/aurora/AuroraModal';

describe('AuroraModal', () => {
  it('does not render when open is false', () => {
    render(
      <AuroraModal open={false} onClose={() => {}}>
        <div>content</div>
      </AuroraModal>
    );
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders children when open is true', () => {
    render(
      <AuroraModal open onClose={() => {}}>
        <div>content</div>
      </AuroraModal>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('fires onClose on backdrop click when dismissible', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose} dismissible>
        <div>content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not fire onClose on backdrop click when not dismissible', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose}>
        <div>content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not propagate clicks inside the content', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose} dismissible>
        <div data-testid="content">content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByTestId('content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

Run: `npm test -- tests/unit/aurora/components/AuroraModal.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the AuroraModal component**

Create `src/components/aurora/AuroraModal.tsx`:

```tsx
import { useEffect, type ReactNode } from 'react';

interface AuroraModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;       // backdrop click + Escape close
  maxWidth?: number;
}

export function AuroraModal({
  open,
  onClose,
  children,
  dismissible = false,
  maxWidth = 560,
}: AuroraModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={dismissible ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--aurora-glass-elevated)',
          border: '1px solid var(--aurora-glass-border)',
          backdropFilter: 'var(--aurora-glass-blur)',
          WebkitBackdropFilter: 'var(--aurora-glass-blur)',
          borderRadius: 'var(--aurora-modal-radius)',
          padding: '28px',
          maxWidth: `${maxWidth}px`,
          width: '100%',
          color: 'var(--aurora-text-primary)',
          boxShadow: 'var(--aurora-shadow-glass)',
          fontFamily: 'var(--aurora-font-ui)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/components/AuroraModal.test.tsx`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/aurora/AuroraModal.tsx tests/unit/aurora/components/AuroraModal.test.tsx
git commit -m "feat(aurora): add AuroraModal glass-overlay base component"
```

## Task 7: Label component (small-caps section markers)

**Files:**
- Create: `src/components/aurora/Label.tsx`
- Create: `tests/unit/aurora/components/Label.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/components/Label.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../../../../src/components/aurora/Label';

describe('Label', () => {
  it('renders children with uppercase + letter-spacing treatment', () => {
    render(<Label>Aiuto · Linguaggio</Label>);
    const el = screen.getByText('Aiuto · Linguaggio');
    expect(el.style.textTransform).toBe('uppercase');
    expect(el.style.letterSpacing).toBe('0.9px');
  });

  it('uses brand pink color by default', () => {
    render(<Label>X</Label>);
    const el = screen.getByText('X');
    expect(el.style.color).toContain('aurora-accent-pink');
  });

  it('uses muted color when muted=true', () => {
    render(<Label muted>X</Label>);
    const el = screen.getByText('X');
    expect(el.style.color).toContain('aurora-text-tertiary');
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

Run: `npm test -- tests/unit/aurora/components/Label.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the Label component**

Create `src/components/aurora/Label.tsx`:

```tsx
import type { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  muted?: boolean;
}

export function Label({ children, muted = false }: LabelProps) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.9px',
        color: muted ? 'var(--aurora-text-tertiary)' : 'var(--aurora-accent-pink)',
        fontFamily: 'var(--aurora-font-ui)',
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/components/Label.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all tests pass (94 existing + 15 new = 109).

- [ ] **Step 6: Commit**

```bash
git add src/components/aurora/Label.tsx tests/unit/aurora/components/Label.test.tsx
git commit -m "feat(aurora): add Label small-caps section marker component"
```

---

# Phase C — Workspace shell

End-of-phase state: visiting `?ui=aurora` renders the new workspace skeleton (top bar + main area + right panel + bottom bar) with placeholder content in each pane. Existing app remains the default.

## Task 8: Workspace grid container

**Files:**
- Create: `src/features/aurora/workspace/Workspace.tsx`
- Create: `tests/unit/aurora/workspace/Workspace.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/Workspace.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workspace } from '../../../../src/features/aurora/workspace/Workspace';

describe('Workspace', () => {
  it('renders all four named slots', () => {
    render(
      <Workspace
        topBar={<div data-testid="t">top</div>}
        mainArea={<div data-testid="m">main</div>}
        rightPanel={<div data-testid="r">right</div>}
        bottomBar={<div data-testid="b">bottom</div>}
      />
    );
    expect(screen.getByTestId('t')).toBeInTheDocument();
    expect(screen.getByTestId('m')).toBeInTheDocument();
    expect(screen.getByTestId('r')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

Run: `npm test -- tests/unit/aurora/workspace/Workspace.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the Workspace component**

Create `src/features/aurora/workspace/Workspace.tsx`:

```tsx
import type { ReactNode } from 'react';

interface WorkspaceProps {
  topBar: ReactNode;
  mainArea: ReactNode;
  rightPanel: ReactNode;
  bottomBar: ReactNode;
}

export function Workspace({ topBar, mainArea, rightPanel, bottomBar }: WorkspaceProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--aurora-pane-gap)',
        padding: 'var(--aurora-pane-gap)',
        height: '100vh',
        maxHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ gridColumn: '1 / -1' }}>{topBar}</div>
      <div style={{ gridRow: 2, minHeight: 0 }}>{mainArea}</div>
      <div style={{ gridRow: 2, minHeight: 0 }}>{rightPanel}</div>
      <div style={{ gridColumn: '1 / -1' }}>{bottomBar}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/Workspace.test.tsx`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/workspace/Workspace.tsx tests/unit/aurora/workspace/Workspace.test.tsx
git commit -m "feat(aurora): add Workspace four-pane grid container"
```

## Task 9: TopBar component

**Files:**
- Create: `src/features/aurora/workspace/TopBar.tsx`
- Create: `tests/unit/aurora/workspace/TopBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/TopBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from '../../../../src/features/aurora/workspace/TopBar';

describe('TopBar', () => {
  it('shows the brand, level indicator, star count, and settings icon', () => {
    render(<TopBar level={3} totalLevels={10} stars={7} onSettingsClick={() => {}} language="it" />);
    expect(screen.getByText('Codino')).toBeInTheDocument();
    expect(screen.getByText(/Livello/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/⭐ 7/)).toBeInTheDocument();
  });

  it('uses English copy when language is en', () => {
    render(<TopBar level={5} totalLevels={10} stars={12} onSettingsClick={() => {}} language="en" />);
    expect(screen.getByText(/Level/)).toBeInTheDocument();
  });

  it('fires onSettingsClick when the gear button is clicked', () => {
    const onSettings = vi.fn();
    render(<TopBar level={3} totalLevels={10} stars={7} onSettingsClick={onSettings} language="it" />);
    fireEvent.click(screen.getByRole('button', { name: /impostazioni|settings/i }));
    expect(onSettings).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

Run: `npm test -- tests/unit/aurora/workspace/TopBar.test.tsx`
Expected: fail with import error.

- [ ] **Step 3: Create the TopBar component**

Create `src/features/aurora/workspace/TopBar.tsx`:

```tsx
import { GlassPane } from '../../../components/aurora/GlassPane';

interface TopBarProps {
  level: number;
  totalLevels: number;
  stars: number;
  language: 'it' | 'en';
  onSettingsClick: () => void;
}

const T = {
  it: { level: 'Livello', of: 'di', settings: 'Impostazioni' },
  en: { level: 'Level', of: 'of', settings: 'Settings' },
};

export function TopBar({ level, totalLevels, stars, language, onSettingsClick }: TopBarProps) {
  const t = T[language];
  return (
    <GlassPane style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>Codino</span>
        <span style={{ color: 'var(--aurora-text-tertiary)' }}>·</span>
        <span style={{ color: 'var(--aurora-text-secondary)', fontSize: '13px' }}>
          {t.level} <strong style={{ color: 'var(--aurora-text-primary)' }}>{level}</strong> {t.of} {totalLevels}
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            color: 'var(--aurora-accent-amber)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textShadow: '0 0 14px rgba(253, 224, 71, 0.5)',
          }}
        >
          ⭐ {stars}
        </span>
        <button
          onClick={onSettingsClick}
          aria-label={t.settings}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '17px',
            opacity: 0.75,
            padding: '4px',
          }}
        >
          ⚙️
        </button>
      </div>
    </GlassPane>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/TopBar.test.tsx`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/workspace/TopBar.tsx tests/unit/aurora/workspace/TopBar.test.tsx
git commit -m "feat(aurora): add TopBar with bilingual labels"
```

## Task 10: BottomBar placeholder (proper MapBar comes in Phase F)

**Files:**
- Create: `src/features/aurora/workspace/BottomBar.tsx`

- [ ] **Step 1: Create the BottomBar placeholder**

Create `src/features/aurora/workspace/BottomBar.tsx`:

```tsx
import type { ReactNode } from 'react';
import { GlassPane } from '../../../components/aurora/GlassPane';

interface BottomBarProps {
  children: ReactNode;
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <GlassPane style={{ padding: '12px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '32px' }}>
        {children}
      </div>
    </GlassPane>
  );
}
```

(No test needed — this is a pure container with no logic. The MapBar in Phase F gets full tests.)

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/workspace/BottomBar.tsx
git commit -m "feat(aurora): add BottomBar container"
```

## Task 11: AuroraApp scaffold (renders the empty workspace)

**Files:**
- Create: `src/features/aurora/AuroraApp.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the AuroraApp with placeholder content in each slot**

Create `src/features/aurora/AuroraApp.tsx`:

```tsx
import { useState } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { Label } from '../../components/aurora/Label';
import { useGameStore } from '../../store/gameStore';

export function AuroraApp() {
  const { currentLevel, stars, language } = useGameStore();
  const [_settingsOpen, setSettingsOpen] = useState(false);
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  return (
    <Workspace
      topBar={
        <TopBar
          level={currentLevel}
          totalLevels={10}
          stars={totalStars}
          language={language}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      }
      mainArea={
        <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Label>📖 Problema</Label>
          <div style={{ color: 'var(--aurora-text-secondary)' }}>Main area placeholder</div>
        </GlassPane>
      }
      rightPanel={
        <GlassPane>
          <Label>Aiuto</Label>
          <div style={{ color: 'var(--aurora-text-secondary)' }}>Right panel placeholder</div>
        </GlassPane>
      }
      bottomBar={
        <BottomBar>
          <Label muted>Mappa</Label>
          <div style={{ flex: 1, color: 'var(--aurora-text-tertiary)' }}>Map strip placeholder</div>
        </BottomBar>
      }
    />
  );
}
```

- [ ] **Step 2: Wire AuroraApp into App.tsx behind the feature flag**

Read `src/App.tsx` to see the current structure (don't print contents; just review). The cutover edit:

Find the line `function App() {` and immediately after the opening brace add:

```tsx
function App() {
  // Aurora feature flag — when present, render the new workspace
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ui') === 'aurora') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AuroraApp } = require('./features/aurora/AuroraApp');
    return <AuroraApp />;
  }

  // ... rest of existing App body ...
```

Actually, dynamic `require()` won't work in Vite. Replace with a static import at the top of the file:

Add to the top imports in `App.tsx`:

```tsx
import { AuroraApp } from './features/aurora/AuroraApp';
```

And after the opening brace of `function App()`:

```tsx
  if (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('ui') === 'aurora') {
    return <AuroraApp />;
  }
```

- [ ] **Step 3: Verify the dev server**

Run: `npm run dev`
- Open `http://localhost:5173/codino/` → existing UI
- Open `http://localhost:5173/codino/?ui=aurora` → see the aurora gradient with four placeholder glass panes in the workspace grid

Stop the dev server.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/AuroraApp.tsx src/App.tsx
git commit -m "feat(aurora): scaffold AuroraApp with placeholder workspace panes"
```

---

# Phase D — Main area

End-of-phase state: the main area shows the real problem text, a working code editor, and the Run/Help buttons. Running code still uses the old execution flow (we'll migrate the right panel in Phase E).

## Task 12: ProblemCard component

**Files:**
- Create: `src/features/aurora/workspace/ProblemCard.tsx`
- Create: `tests/unit/aurora/workspace/ProblemCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/ProblemCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemCard } from '../../../../src/features/aurora/workspace/ProblemCard';

describe('ProblemCard', () => {
  it('renders the narrative and expected output', () => {
    render(
      <ProblemCard
        narrative="Il drago ha 5 monete d'oro."
        expectedOutput="8"
        language="it"
      />
    );
    expect(screen.getByText("Il drago ha 5 monete d'oro.")).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows the bilingual problem label in Italian', () => {
    render(<ProblemCard narrative="x" expectedOutput="1" language="it" />);
    expect(screen.getByText(/Problema/)).toBeInTheDocument();
  });

  it('shows the bilingual problem label in English', () => {
    render(<ProblemCard narrative="x" expectedOutput="1" language="en" />);
    expect(screen.getByText(/Problem/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (fails)**

Run: `npm test -- tests/unit/aurora/workspace/ProblemCard.test.tsx`
Expected: import failure.

- [ ] **Step 3: Create the ProblemCard component**

Create `src/features/aurora/workspace/ProblemCard.tsx`:

```tsx
import { Label } from '../../../components/aurora/Label';

interface ProblemCardProps {
  narrative: string;
  expectedOutput: string;
  language: 'it' | 'en';
}

const T = {
  it: { title: '📖 Problema', expected: 'Output atteso' },
  en: { title: '📖 Problem',  expected: 'Expected output' },
};

export function ProblemCard({ narrative, expectedOutput, language }: ProblemCardProps) {
  const t = T[language];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Label>{t.title}</Label>
      <div
        style={{
          fontSize: '14.5px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'var(--aurora-text-primary)',
        }}
      >
        {narrative}
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '12px',
          color: 'var(--aurora-text-tertiary)',
        }}
      >
        {t.expected}: <code style={{ fontFamily: 'var(--aurora-font-code)', color: 'var(--aurora-text-secondary)' }}>{expectedOutput}</code>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/ProblemCard.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/workspace/ProblemCard.tsx tests/unit/aurora/workspace/ProblemCard.test.tsx
git commit -m "feat(aurora): add ProblemCard with bilingual labels"
```

## Task 13: EditorPane component

Wraps the existing `CodeEditor` with optional inline error/runtime cards beneath.

**Files:**
- Create: `src/features/aurora/workspace/EditorPane.tsx`
- Create: `src/features/aurora/inline-errors/ParseErrorCard.tsx`
- Create: `src/features/aurora/inline-errors/RuntimeErrorCard.tsx`
- Create: `tests/unit/aurora/inline-errors/ParseErrorCard.test.tsx`

- [ ] **Step 1: Write the test for ParseErrorCard**

Create `tests/unit/aurora/inline-errors/ParseErrorCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParseErrorCard } from '../../../../src/features/aurora/inline-errors/ParseErrorCard';
import type { ParseError } from '../../../../src/core/language';

describe('ParseErrorCard', () => {
  it('shows a friendly typo message with suggestion', () => {
    const err: ParseError = { type: 'typo-keyword', line: 1, found: 'RIPETTI', suggestion: 'RIPETI' };
    render(<ParseErrorCard error={err} language="it" />);
    expect(screen.getByText(/RIPETTI/)).toBeInTheDocument();
    expect(screen.getByText(/RIPETI/)).toBeInTheDocument();
    expect(screen.getByText(/riga 1/i)).toBeInTheDocument();
  });

  it('shows a friendly missing-end message', () => {
    const err: ParseError = { type: 'missing-end', line: 3 };
    render(<ParseErrorCard error={err} language="it" />);
    expect(screen.getByText(/FINE/)).toBeInTheDocument();
    expect(screen.getByText(/riga 3/i)).toBeInTheDocument();
  });

  it('shows a generic syntax-error message', () => {
    const err: ParseError = { type: 'syntax-error', line: 2, found: '=' };
    render(<ParseErrorCard error={err} language="en" />);
    expect(screen.getByText(/line 2/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (fails)**

Run: `npm test -- tests/unit/aurora/inline-errors/ParseErrorCard.test.tsx`
Expected: import failure.

- [ ] **Step 3: Create the ParseErrorCard component**

Create `src/features/aurora/inline-errors/ParseErrorCard.tsx`:

```tsx
import type { ParseError } from '../../../core/language';

interface ParseErrorCardProps {
  error: ParseError;
  language: 'it' | 'en';
}

function buildMessage(error: ParseError, language: 'it' | 'en'): string {
  const lineLabel = language === 'it' ? 'riga' : 'line';
  switch (error.type) {
    case 'typo-keyword':
      return language === 'it'
        ? `Hai scritto "${error.found}" alla ${lineLabel} ${error.line} — forse intendevi ${error.suggestion}? 🤔`
        : `You wrote "${error.found}" on ${lineLabel} ${error.line} — did you mean ${error.suggestion}? 🤔`;
    case 'missing-end':
      return language === 'it'
        ? `Il blocco alla ${lineLabel} ${error.line} ha bisogno di un FINE! 🤔`
        : `The block on ${lineLabel} ${error.line} needs a FINE (or END)! 🤔`;
    case 'syntax-error':
    default:
      return language === 'it'
        ? `C'è un problema alla ${lineLabel} ${error.line}.`
        : `There's a problem on ${lineLabel} ${error.line}.`;
  }
}

export function ParseErrorCard({ error, language }: ParseErrorCardProps) {
  return (
    <div
      style={{
        background: 'rgba(253, 164, 175, 0.10)',
        border: '1px solid rgba(253, 164, 175, 0.30)',
        borderLeft: '3px solid var(--aurora-accent-error)',
        borderRadius: 'var(--aurora-card-radius)',
        padding: '10px 14px',
        color: 'var(--aurora-text-primary)',
        fontSize: '13.5px',
        lineHeight: 1.5,
      }}
    >
      {buildMessage(error, language)}
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/inline-errors/ParseErrorCard.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Create the RuntimeErrorCard component**

Create `src/features/aurora/inline-errors/RuntimeErrorCard.tsx`:

```tsx
interface RuntimeErrorCardProps {
  message: string;
  line: number;
  language: 'it' | 'en';
}

export function RuntimeErrorCard({ message, line, language }: RuntimeErrorCardProps) {
  const lineLabel = language === 'it' ? 'riga' : 'line';
  return (
    <div
      style={{
        background: 'rgba(253, 164, 175, 0.10)',
        border: '1px solid rgba(253, 164, 175, 0.30)',
        borderLeft: '3px solid var(--aurora-accent-error)',
        borderRadius: 'var(--aurora-card-radius)',
        padding: '10px 14px',
        color: 'var(--aurora-text-primary)',
        fontSize: '13.5px',
        lineHeight: 1.5,
      }}
    >
      🤔 {lineLabel.charAt(0).toUpperCase() + lineLabel.slice(1)} {line}: {message}
    </div>
  );
}
```

- [ ] **Step 6: Create the EditorPane component**

Create `src/features/aurora/workspace/EditorPane.tsx`:

```tsx
import type { ParseError } from '../../../core/language';
import { CodeEditor } from '../../editor/CodeEditor';
import { Label } from '../../../components/aurora/Label';
import { ParseErrorCard } from '../inline-errors/ParseErrorCard';
import { RuntimeErrorCard } from '../inline-errors/RuntimeErrorCard';

interface EditorPaneProps {
  code: string;
  onChange: (code: string) => void;
  highlightedLine?: number | null;
  readOnly?: boolean;
  language: 'it' | 'en';
  parseErrors?: ParseError[];
  runtimeError?: { message: string; line: number } | null;
}

export function EditorPane({
  code,
  onChange,
  highlightedLine,
  readOnly = false,
  language,
  parseErrors = [],
  runtimeError = null,
}: EditorPaneProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
      <Label>Editor</Label>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeEditor
          code={code}
          onChange={onChange}
          highlightedLine={highlightedLine ?? null}
          readOnly={readOnly}
        />
      </div>
      {parseErrors.length > 0 && (
        <ParseErrorCard error={parseErrors[0]} language={language} />
      )}
      {runtimeError && (
        <RuntimeErrorCard message={runtimeError.message} line={runtimeError.line} language={language} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/features/aurora/workspace/EditorPane.tsx \
        src/features/aurora/inline-errors/ \
        tests/unit/aurora/inline-errors/
git commit -m "feat(aurora): add EditorPane with inline parse/runtime error cards"
```

## Task 14: RunControls component

**Files:**
- Create: `src/features/aurora/workspace/RunControls.tsx`

- [ ] **Step 1: Create the RunControls component**

Create `src/features/aurora/workspace/RunControls.tsx`:

```tsx
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface RunControlsProps {
  onRun: () => void;
  onHelp: () => void;
  running?: boolean;
  helpLoading?: boolean;
  language: 'it' | 'en';
}

const T = {
  it: { help: '❓ Aiuto', helpWait: '⏳ Pensando…', run: '▶ ESEGUI', running: '▶ Eseguendo…' },
  en: { help: '❓ Help',   helpWait: '⏳ Thinking…', run: '▶ RUN',     running: '▶ Running…'  },
};

export function RunControls({ onRun, onHelp, running = false, helpLoading = false, language }: RunControlsProps) {
  const t = T[language];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
      <AuroraButton variant="ghost" onClick={onHelp} disabled={helpLoading || running}>
        {helpLoading ? t.helpWait : t.help}
      </AuroraButton>
      <div style={{ flex: 1 }} />
      <AuroraButton variant="primary" onClick={onRun} disabled={running}>
        {running ? t.running : t.run}
      </AuroraButton>
    </div>
  );
}
```

(No standalone test — covered by the integration test in Phase I.)

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/workspace/RunControls.tsx
git commit -m "feat(aurora): add RunControls button row"
```

## Task 15: MainArea integration in AuroraApp

Wire ProblemCard + EditorPane + RunControls into AuroraApp's main slot. The right panel still shows the placeholder.

**Files:**
- Modify: `src/features/aurora/AuroraApp.tsx`

- [ ] **Step 1: Update AuroraApp's main slot**

Replace the `mainArea` prop of the `Workspace` in `AuroraApp.tsx` with this content (and add the needed state):

At the top of `AuroraApp.tsx`, add imports:

```tsx
import { ProblemCard } from './workspace/ProblemCard';
import { EditorPane } from './workspace/EditorPane';
import { RunControls } from './workspace/RunControls';
import { GlassPane as _GP } from '../../components/aurora/GlassPane';  // already imported
```

Inside the AuroraApp function, just after the existing `const { currentLevel, stars, language } = useGameStore();` line, add:

```tsx
  const { currentProblem, currentCode, setCode } = useGameStore();
```

Then replace the `mainArea={ ... }` block with:

```tsx
      mainArea={
        <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
          {currentProblem ? (
            <ProblemCard
              narrative={currentProblem.narrative}
              expectedOutput={currentProblem.expectedOutput}
              language={language}
            />
          ) : (
            <div style={{ color: 'var(--aurora-text-tertiary)' }}>
              {language === 'it' ? 'In attesa di un problema…' : 'Waiting for a problem…'}
            </div>
          )}
          <EditorPane
            code={currentCode}
            onChange={setCode}
            language={language}
          />
          <RunControls
            onRun={() => { /* wired in Phase E */ }}
            onHelp={() => { /* wired in Phase E */ }}
            language={language}
          />
        </GlassPane>
      }
```

- [ ] **Step 2: Visually verify**

Run: `npm run dev`
Visit `http://localhost:5173/codino/?ui=aurora`. You should see the problem (or "waiting" placeholder), the editor, and the two buttons. The buttons don't do anything yet — wiring happens in Phase E.
Stop the dev server.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/aurora/AuroraApp.tsx
git commit -m "feat(aurora): integrate ProblemCard, EditorPane, RunControls into MainArea"
```

---

# Phase E — Right panel (Help + Execution with crossfade)

End-of-phase state: the right panel shows a working language reference by default and crossfades to Output + Variables during execution. Running code works end-to-end in the new workspace.

## Task 16: HelpPanel with collapsible categories

**Files:**
- Create: `src/features/aurora/workspace/HelpPanel.tsx`
- Create: `tests/unit/aurora/workspace/HelpPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/HelpPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpPanel } from '../../../../src/features/aurora/workspace/HelpPanel';

describe('HelpPanel', () => {
  it('renders all four category headers in Italian', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    expect(screen.getByText(/Stampare/)).toBeInTheDocument();
    expect(screen.getByText(/Matematica/)).toBeInTheDocument();
    expect(screen.getByText(/Ripetizioni/)).toBeInTheDocument();
    expect(screen.getByText(/Condizioni/)).toBeInTheDocument();
  });

  it('renders all four category headers in English', () => {
    render(<HelpPanel language="en" currentLevel={1} />);
    expect(screen.getByText(/Printing/)).toBeInTheDocument();
    expect(screen.getByText(/Math/)).toBeInTheDocument();
    expect(screen.getByText(/Loops/)).toBeInTheDocument();
    expect(screen.getByText(/Conditions/)).toBeInTheDocument();
  });

  it('auto-expands the math category at level 3', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    // Math has the "+ - x :" example card; should be visible by default at level 3.
    expect(screen.getByText(/somma · sottrai/)).toBeInTheDocument();
  });

  it('lets the user toggle a closed category open', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    // Loops should be closed at level 3.
    const loopsHeader = screen.getByText(/Ripetizioni/);
    fireEvent.click(loopsHeader);
    expect(screen.getByText(/RIPETI/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (fails)**

Run: `npm test -- tests/unit/aurora/workspace/HelpPanel.test.tsx`
Expected: import failure.

- [ ] **Step 3: Create the HelpPanel component**

Create `src/features/aurora/workspace/HelpPanel.tsx`:

```tsx
import { useState } from 'react';
import { Label } from '../../../components/aurora/Label';

type CategoryKey = 'print' | 'math' | 'loops' | 'conditions';

interface HelpPanelProps {
  language: 'it' | 'en';
  currentLevel: number;
}

interface CategoryDef {
  key: CategoryKey;
  iconAndTitle: { it: string; en: string };
  cards: Array<{ kw: string; ex: { it: string; en: string } }>;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'print',
    iconAndTitle: { it: '📝 Stampare', en: '📝 Printing' },
    cards: [
      { kw: 'SCRIVI x', ex: { it: 'mostra un valore', en: 'print a value' } },
      { kw: 'WRITE x',  ex: { it: 'lo stesso in inglese', en: 'same in English' } },
    ],
  },
  {
    key: 'math',
    iconAndTitle: { it: '➕ Matematica', en: '➕ Math' },
    cards: [
      { kw: '+   –   x   :', ex: { it: 'somma · sottrai · moltiplica · dividi', en: 'add · subtract · multiply · divide' } },
    ],
  },
  {
    key: 'loops',
    iconAndTitle: { it: '🔁 Ripetizioni', en: '🔁 Loops' },
    cards: [
      { kw: 'RIPETI 5 VOLTE … FINE', ex: { it: 'ripete 5 volte', en: 'repeats 5 times' } },
    ],
  },
  {
    key: 'conditions',
    iconAndTitle: { it: '🤔 Condizioni', en: '🤔 Conditions' },
    cards: [
      { kw: 'SE x > 5 … FINE',                ex: { it: 'esegue se la condizione è vera', en: 'runs if true' } },
      { kw: 'SE … ALTRIMENTI … FINE',         ex: { it: 'oppure questo se è falsa',        en: 'or this if false' } },
    ],
  },
];

function defaultExpanded(level: number): CategoryKey {
  if (level <= 2) return 'print';
  if (level <= 4) return 'math';
  if (level <= 6) return 'loops';
  return 'conditions';
}

const PANEL_TITLE = { it: 'Aiuto · Linguaggio', en: 'Help · Language' };

export function HelpPanel({ language, currentLevel }: HelpPanelProps) {
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(
    new Set([defaultExpanded(currentLevel)])
  );

  const toggle = (key: CategoryKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto' }}>
      <Label>{PANEL_TITLE[language]}</Label>
      {CATEGORIES.map((cat) => {
        const isOpen = expanded.has(cat.key);
        return (
          <div key={cat.key}>
            <div
              onClick={() => toggle(cat.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: isOpen ? 'var(--aurora-accent-pink)' : 'var(--aurora-text-secondary)',
                paddingBottom: '6px',
              }}
            >
              <span>{cat.iconAndTitle[language]}</span>
              <span style={{ fontSize: '11px', color: 'var(--aurora-text-tertiary)' }}>{isOpen ? '▾' : '▸'}</span>
            </div>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {cat.cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--aurora-card-radius)',
                      padding: '9px 11px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '12.5px', color: 'var(--aurora-text-primary)', fontWeight: 600 }}>
                      {card.kw}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--aurora-text-tertiary)', marginTop: '3px' }}>
                      {card.ex[language]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/HelpPanel.test.tsx`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/workspace/HelpPanel.tsx tests/unit/aurora/workspace/HelpPanel.test.tsx
git commit -m "feat(aurora): add HelpPanel with collapsible language categories"
```

## Task 17: ExecutionPanel (Output + Variables)

**Files:**
- Create: `src/features/aurora/workspace/ExecutionPanel.tsx`

- [ ] **Step 1: Create the ExecutionPanel component**

Create `src/features/aurora/workspace/ExecutionPanel.tsx`:

```tsx
import { Label } from '../../../components/aurora/Label';

interface ExecutionPanelProps {
  output: string;
  variables: Record<string, number | string>;
  language: 'it' | 'en';
}

const T = {
  it: { output: 'Output', variables: 'Variabili', empty: '(vuoto)' },
  en: { output: 'Output', variables: 'Variables', empty: '(empty)' },
};

export function ExecutionPanel({ output, variables, language }: ExecutionPanelProps) {
  const t = T[language];
  const entries = Object.entries(variables);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label>{t.output}</Label>
        <div
          style={{
            background: 'rgba(110, 231, 183, 0.10)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            borderRadius: 'var(--aurora-card-radius)',
            padding: '10px 12px',
            fontFamily: 'var(--aurora-font-code)',
            fontSize: '13px',
            color: 'var(--aurora-text-primary)',
            whiteSpace: 'pre-wrap',
            minHeight: '40px',
          }}
        >
          {output || <span style={{ color: 'var(--aurora-text-tertiary)' }}>{t.empty}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label>{t.variables}</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entries.length === 0 && (
            <span style={{ color: 'var(--aurora-text-tertiary)', fontSize: '12px' }}>{t.empty}</span>
          )}
          {entries.map(([name, value]) => (
            <div
              key={name}
              style={{
                background: 'rgba(240, 171, 252, 0.10)',
                border: '1px solid rgba(240, 171, 252, 0.25)',
                borderRadius: 'var(--aurora-card-radius)',
                padding: '6px 10px',
                fontFamily: 'var(--aurora-font-code)',
                fontSize: '12.5px',
                color: 'var(--aurora-text-primary)',
              }}
            >
              <strong>{name}</strong> = {String(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/workspace/ExecutionPanel.tsx
git commit -m "feat(aurora): add ExecutionPanel (Output + Variables)"
```

## Task 18: RightPanel crossfade host

**Files:**
- Create: `src/features/aurora/workspace/RightPanel.tsx`
- Create: `tests/unit/aurora/workspace/RightPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/RightPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RightPanel } from '../../../../src/features/aurora/workspace/RightPanel';

describe('RightPanel', () => {
  it('shows the help slot when mode is help', () => {
    render(
      <RightPanel
        mode="help"
        help={<div data-testid="h">help</div>}
        execution={<div data-testid="e">exec</div>}
      />
    );
    expect(screen.getByTestId('h')).toBeInTheDocument();
  });

  it('shows the execution slot when mode is execution', () => {
    render(
      <RightPanel
        mode="execution"
        help={<div data-testid="h">help</div>}
        execution={<div data-testid="e">exec</div>}
      />
    );
    expect(screen.getByTestId('e')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test (fails)**

Run: `npm test -- tests/unit/aurora/workspace/RightPanel.test.tsx`
Expected: import failure.

- [ ] **Step 3: Create the RightPanel component**

Create `src/features/aurora/workspace/RightPanel.tsx`:

```tsx
import type { ReactNode } from 'react';
import { GlassPane } from '../../../components/aurora/GlassPane';

interface RightPanelProps {
  mode: 'help' | 'execution';
  help: ReactNode;
  execution: ReactNode;
}

export function RightPanel({ mode, help, execution }: RightPanelProps) {
  return (
    <GlassPane style={{ display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div
        className="aurora-anim"
        style={{
          opacity: mode === 'help' ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: mode === 'help' ? 'auto' : 'none',
          position: mode === 'help' ? 'static' : 'absolute',
          inset: 0,
          padding: mode === 'help' ? 0 : 'var(--aurora-pane-padding)',
          display: mode === 'help' ? 'flex' : 'block',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        {help}
      </div>
      <div
        className="aurora-anim"
        style={{
          opacity: mode === 'execution' ? 1 : 0,
          transition: 'opacity 300ms ease',
          transitionDelay: mode === 'execution' ? '200ms' : '0ms',
          pointerEvents: mode === 'execution' ? 'auto' : 'none',
          position: mode === 'execution' ? 'static' : 'absolute',
          inset: 0,
          padding: mode === 'execution' ? 0 : 'var(--aurora-pane-padding)',
          display: mode === 'execution' ? 'flex' : 'block',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        {execution}
      </div>
    </GlassPane>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/RightPanel.test.tsx`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/aurora/workspace/RightPanel.tsx tests/unit/aurora/workspace/RightPanel.test.tsx
git commit -m "feat(aurora): add RightPanel crossfade host"
```

## Task 19: Wire run + help + execution into AuroraApp

This is a substantial integration step — the AuroraApp now drives parsing, execution, animation, hint generation, and the right-panel mode transitions.

**Files:**
- Modify: `src/features/aurora/AuroraApp.tsx`

- [ ] **Step 1: Replace AuroraApp with the wired version**

Overwrite `src/features/aurora/AuroraApp.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { Label } from '../../components/aurora/Label';
import { ProblemCard } from './workspace/ProblemCard';
import { EditorPane } from './workspace/EditorPane';
import { RunControls } from './workspace/RunControls';
import { RightPanel } from './workspace/RightPanel';
import { HelpPanel } from './workspace/HelpPanel';
import { ExecutionPanel } from './workspace/ExecutionPanel';
import { useGameStore } from '../../store/gameStore';
import { useClaudeAPI } from '../../core/api/useClaudeAPI';
import { parseWithErrors, execute, type ParseError } from '../../core/language';

const STEP_DURATION_MS = 1500;

type Mode = 'idle' | 'executing';

export function AuroraApp() {
  const { currentProblem, currentCode, setCode, currentLevel, stars, language } = useGameStore();
  const apiClient = useClaudeAPI();
  const [_settingsOpen, setSettingsOpen] = useState(false);

  const [mode, setMode] = useState<Mode>('idle');
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<ReturnType<typeof execute>['steps']>([]);

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  // Step the animation when executing
  useEffect(() => {
    if (mode !== 'executing') return;
    if (stepIndex >= steps.length) {
      setHighlightedLine(null);
      setMode('idle');
      return;
    }
    const step = steps[stepIndex];
    setHighlightedLine(step.line);
    const timer = setTimeout(() => {
      if (step.output) setOutput((o) => (o ? `${o}\n${step.output}` : step.output!));
      setVariables(step.variables);
      setStepIndex((i) => i + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [mode, stepIndex, steps]);

  const handleRun = () => {
    if (mode !== 'idle') return;
    setHint(null);
    setRuntimeError(null);
    setOutput('');
    setVariables({});
    setStepIndex(0);

    const { tree, errors } = parseWithErrors(currentCode);
    setParseErrors(errors);
    if (errors.length > 0) return;

    const result = execute(tree, currentCode);
    if (result.error) {
      setRuntimeError({ message: result.error.message, line: result.error.line });
      return;
    }
    setSteps(result.steps);
    setMode('executing');
  };

  const handleHelp = async () => {
    if (!apiClient || !currentProblem) return;
    setHintLoading(true);
    try {
      const { hint: text } = await apiClient.generateHint({
        problem: currentProblem.narrative,
        code: currentCode,
        language,
      });
      setHint(text);
    } catch {
      setHint(language === 'it' ? 'Riprova a leggere il problema!' : 'Try reading the problem again!');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <Workspace
      topBar={
        <TopBar
          level={currentLevel}
          totalLevels={10}
          stars={totalStars}
          language={language}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      }
      mainArea={
        <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
          {currentProblem ? (
            <ProblemCard
              narrative={currentProblem.narrative}
              expectedOutput={currentProblem.expectedOutput}
              language={language}
            />
          ) : (
            <div style={{ color: 'var(--aurora-text-tertiary)' }}>
              {language === 'it' ? 'In attesa di un problema…' : 'Waiting for a problem…'}
            </div>
          )}
          <EditorPane
            code={currentCode}
            onChange={setCode}
            language={language}
            highlightedLine={highlightedLine}
            readOnly={mode === 'executing'}
            parseErrors={parseErrors}
            runtimeError={runtimeError}
          />
          {hint && (
            <div
              style={{
                background: 'rgba(253, 224, 71, 0.10)',
                border: '1px solid rgba(253, 224, 71, 0.25)',
                borderLeft: '3px solid var(--aurora-accent-amber)',
                borderRadius: 'var(--aurora-card-radius)',
                padding: '10px 14px',
                color: 'var(--aurora-text-primary)',
                fontSize: '13.5px',
                lineHeight: 1.5,
              }}
            >
              💡 {hint}
            </div>
          )}
          <RunControls
            onRun={handleRun}
            onHelp={handleHelp}
            running={mode === 'executing'}
            helpLoading={hintLoading}
            language={language}
          />
        </GlassPane>
      }
      rightPanel={
        <RightPanel
          mode={mode === 'executing' ? 'execution' : 'help'}
          help={<HelpPanel language={language} currentLevel={Math.max(1, currentLevel)} />}
          execution={<ExecutionPanel output={output} variables={variables} language={language} />}
        />
      }
      bottomBar={
        <BottomBar>
          <Label muted>Mappa</Label>
          <div style={{ flex: 1, color: 'var(--aurora-text-tertiary)' }}>
            Map strip placeholder (Phase F)
          </div>
        </BottomBar>
      }
    />
  );
}
```

- [ ] **Step 2: Test manually**

Run: `npm run dev`. Visit `http://localhost:5173/codino/?ui=aurora`.

If you have no API key set, you won't have a problem. To verify the run flow:
- Open browser console and run:
  ```js
  useGameStore = window.useGameStore; // not actually exposed; instead:
  ```
  Easier: open Settings via existing UI (default URL), set an API key, then visit `?ui=aurora`. Or use localStorage manually:
  ```js
  localStorage.setItem('codino_current_level', JSON.stringify({
    problem: { narrative: 'Print 5', expectedOutput: '5' },
    code: 'SCRIVI 5'
  }));
  location.reload();
  ```
  Then in the aurora workspace, click ▶ ESEGUI. Observe the editor freezing, line highlighting, and the right panel crossfading to Output (showing "5") and Variables.

Stop the dev server.

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: all pass (no new test in this task; integration verified manually).

- [ ] **Step 4: Commit**

```bash
git add src/features/aurora/AuroraApp.tsx
git commit -m "feat(aurora): wire run, help, and crossfade execution into AuroraApp"
```

---

# Phase F — MapBar

End-of-phase state: the bottom bar shows the real 10-node horizontal map with completed/current/locked states reading from the store.

## Task 20: MapBar component

**Files:**
- Create: `src/features/aurora/workspace/MapBar.tsx`
- Create: `tests/unit/aurora/workspace/MapBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/aurora/workspace/MapBar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapBar } from '../../../../src/features/aurora/workspace/MapBar';

describe('MapBar', () => {
  it('renders exactly 10 level nodes', () => {
    const { container } = render(<MapBar completedLevels={[]} currentLevel={1} chosenElements={[]} language="it" />);
    const nodes = container.querySelectorAll('[data-node]');
    expect(nodes.length).toBe(10);
  });

  it('marks completed levels with their chosen emoji', () => {
    render(
      <MapBar
        completedLevels={[1, 2]}
        currentLevel={3}
        chosenElements={[
          { emoji: '🏰', name: 'castello' },
          { emoji: '⚔️', name: 'spada' },
        ]}
        language="it"
      />
    );
    expect(screen.getByText('🏰')).toBeInTheDocument();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('shows the level number on the current node', () => {
    render(<MapBar completedLevels={[1]} currentLevel={2} chosenElements={[{ emoji: '🏰', name: 'castle' }]} language="en" />);
    const currentNode = screen.getByTestId('node-current');
    expect(currentNode.textContent).toBe('2');
  });
});
```

- [ ] **Step 2: Run the test (fails)**

Run: `npm test -- tests/unit/aurora/workspace/MapBar.test.tsx`
Expected: import failure.

- [ ] **Step 3: Create the MapBar component**

Create `src/features/aurora/workspace/MapBar.tsx`:

```tsx
import type { Element } from '../../../types/game';

interface MapBarProps {
  completedLevels: number[];
  currentLevel: number;
  chosenElements: Element[];
  language: 'it' | 'en';
}

const LABEL = { it: 'Mappa', en: 'Map' };

export function MapBar({ completedLevels, currentLevel, chosenElements, language }: MapBarProps) {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const isCompleted = (lvl: number) => completedLevels.includes(lvl);
  const isCurrent = (lvl: number) => lvl === currentLevel + 1 && !isCompleted(lvl) && currentLevel < 10;

  return (
    <>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--aurora-text-tertiary)',
        }}
      >
        {LABEL[language]}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
        {levels.map((lvl, idx) => {
          const done = isCompleted(lvl);
          const current = isCurrent(lvl);
          return (
            <>
              <div
                key={lvl}
                data-node
                data-testid={current ? 'node-current' : done ? 'node-done' : 'node-locked'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: current ? '27px' : '22px',
                    height: current ? '27px' : '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: done ? 'white' : current ? 'white' : 'var(--aurora-text-tertiary)',
                    background: done
                      ? 'linear-gradient(135deg, var(--aurora-accent-purple), var(--aurora-accent-pink))'
                      : current
                      ? 'linear-gradient(135deg, var(--aurora-accent-amber), #f59e0b)'
                      : 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    boxShadow: done
                      ? '0 0 14px rgba(192, 132, 252, 0.55)'
                      : current
                      ? '0 0 18px rgba(253, 224, 71, 0.70)'
                      : 'none',
                  }}
                >
                  {done ? chosenElements[idx]?.emoji ?? '' : lvl === 10 ? '🏁' : String(lvl)}
                </div>
              </div>
              {idx < levels.length - 1 && (
                <div
                  style={{
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    flex: 0.4,
                    minWidth: '12px',
                    borderRadius: '1px',
                  }}
                />
              )}
            </>
          );
        })}
      </div>
    </>
  );
}
```

(React will complain about repeated key warnings because of the inline fragments — wrap each entry in a Fragment with a stable key.)

Replace the inner mapping with this corrected version:

```tsx
        {levels.map((lvl, idx) => {
          const done = isCompleted(lvl);
          const current = isCurrent(lvl);
          return (
            <span key={lvl} style={{ display: 'contents' }}>
              <div
                data-node
                data-testid={current ? 'node-current' : done ? 'node-done' : 'node-locked'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: current ? '27px' : '22px',
                    height: current ? '27px' : '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: done || current ? 'white' : 'var(--aurora-text-tertiary)',
                    background: done
                      ? 'linear-gradient(135deg, var(--aurora-accent-purple), var(--aurora-accent-pink))'
                      : current
                      ? 'linear-gradient(135deg, var(--aurora-accent-amber), #f59e0b)'
                      : 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    boxShadow: done
                      ? '0 0 14px rgba(192, 132, 252, 0.55)'
                      : current
                      ? '0 0 18px rgba(253, 224, 71, 0.70)'
                      : 'none',
                  }}
                >
                  {done ? chosenElements[idx]?.emoji ?? '' : lvl === 10 ? '🏁' : String(lvl)}
                </div>
              </div>
              {idx < levels.length - 1 && (
                <div
                  style={{
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    flex: 0.4,
                    minWidth: '12px',
                    borderRadius: '1px',
                  }}
                />
              )}
            </span>
          );
        })}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- tests/unit/aurora/workspace/MapBar.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Integrate into AuroraApp**

In `src/features/aurora/AuroraApp.tsx`:

Add import:
```tsx
import { MapBar } from './workspace/MapBar';
```

Replace the `bottomBar={ ... }` block with:

```tsx
      bottomBar={
        <BottomBar>
          <MapBar
            completedLevels={useGameStore.getState().completedLevels}
            currentLevel={currentLevel}
            chosenElements={useGameStore.getState().chosenElements}
            language={language}
          />
        </BottomBar>
      }
```

Actually we want to read these reactively, not via getState. At the top of AuroraApp, expand the destructuring:

```tsx
  const { currentProblem, currentCode, setCode, currentLevel, stars, language, completedLevels, chosenElements } = useGameStore();
```

Then use the destructured values directly:

```tsx
      bottomBar={
        <BottomBar>
          <MapBar
            completedLevels={completedLevels}
            currentLevel={currentLevel}
            chosenElements={chosenElements}
            language={language}
          />
        </BottomBar>
      }
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/features/aurora/workspace/MapBar.tsx src/features/aurora/AuroraApp.tsx tests/unit/aurora/workspace/MapBar.test.tsx
git commit -m "feat(aurora): add MapBar with 10-node horizontal strip"
```

---

# Phase G — Modals

End-of-phase state: every modal pattern in the redesign is built: Welcome/Story, Settings, MapError, WrongOutput, GameComplete. All wired into AuroraApp's state machine.

## Task 21: WelcomeStoryModal

Combines the previous WelcomeScreen + StoryInput into a single first-launch modal.

**Files:**
- Create: `src/features/aurora/modals/WelcomeStoryModal.tsx`

- [ ] **Step 1: Create the WelcomeStoryModal component**

Create `src/features/aurora/modals/WelcomeStoryModal.tsx`:

```tsx
import { useState } from 'react';
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface WelcomeStoryModalProps {
  open: boolean;
  language: 'it' | 'en';
  onSubmit: (story: string) => void;
  onGetIdeas?: () => Promise<string[]>;
}

const T = {
  it: {
    title: 'Benvenuto in Codino!',
    subtitle: 'Racconta la tua avventura.',
    placeholder: "C'era una volta…",
    examples: [
      'Un coraggioso cavaliere alla ricerca del tesoro…',
      'Un esploratore spaziale visita pianeti lontani…',
      'Un mago impara nuovi incantesimi…',
    ],
    examplesLabel: 'Esempi',
    ideasButton: "Dammi un'idea 💡",
    ideasLoading: '⏳ Penso…',
    ideasLabel: 'Idee generate',
    submit: "Inizia l'avventura",
  },
  en: {
    title: 'Welcome to Codino!',
    subtitle: 'Tell your adventure.',
    placeholder: 'Once upon a time…',
    examples: [
      'A brave knight searches for treasure…',
      'A space explorer visits distant planets…',
      'A wizard learns new spells…',
    ],
    examplesLabel: 'Examples',
    ideasButton: 'Give me ideas 💡',
    ideasLoading: '⏳ Thinking…',
    ideasLabel: 'Generated ideas',
    submit: 'Start adventure',
  },
};

export function WelcomeStoryModal({ open, language, onSubmit, onGetIdeas }: WelcomeStoryModalProps) {
  const t = T[language];
  const [story, setStory] = useState('');
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);

  const handleGetIdeas = async () => {
    if (!onGetIdeas) return;
    setIdeasLoading(true);
    try {
      setAiIdeas(await onGetIdeas());
    } catch {
      // silent
    } finally {
      setIdeasLoading(false);
    }
  };

  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={640}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{t.title}</h2>
      <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '18px' }}>{t.subtitle}</p>

      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder={t.placeholder}
        maxLength={500}
        style={{
          width: '100%',
          height: '110px',
          padding: '12px 14px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--aurora-glass-border)',
          borderRadius: 'var(--aurora-card-radius)',
          color: 'var(--aurora-text-primary)',
          fontFamily: 'var(--aurora-font-ui)',
          fontSize: '14.5px',
          lineHeight: 1.4,
          resize: 'none',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
        <span style={{ color: 'var(--aurora-text-tertiary)', fontSize: '12px' }}>{story.length} / 500</span>
        {onGetIdeas && (
          <button
            onClick={handleGetIdeas}
            disabled={ideasLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--aurora-accent-pink)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {ideasLoading ? t.ideasLoading : t.ideasButton}
          </button>
        )}
      </div>

      {aiIdeas.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-success)', marginBottom: '6px' }}>{t.ideasLabel}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {aiIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => setStory(idea)}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(110, 231, 183, 0.15)',
                  border: '1px solid rgba(110, 231, 183, 0.30)',
                  borderRadius: 'var(--aurora-card-radius)',
                  color: 'var(--aurora-accent-success)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {idea.split('...')[0]}…
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-pink)', marginBottom: '6px' }}>{t.examplesLabel}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {t.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setStory(ex)}
              style={{
                padding: '6px 10px',
                background: 'rgba(240, 171, 252, 0.12)',
                border: '1px solid rgba(240, 171, 252, 0.25)',
                borderRadius: 'var(--aurora-card-radius)',
                color: 'var(--aurora-accent-pink)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {ex.split('...')[0]}…
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '22px', textAlign: 'center' }}>
        <AuroraButton
          variant="primary"
          onClick={() => story.trim() && onSubmit(story.trim())}
          disabled={!story.trim()}
        >
          {t.submit}
        </AuroraButton>
      </div>
    </AuroraModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/modals/WelcomeStoryModal.tsx
git commit -m "feat(aurora): add WelcomeStoryModal (collapses welcome + story input)"
```

## Task 22: SettingsModal

**Files:**
- Create: `src/features/aurora/modals/SettingsModal.tsx`

- [ ] **Step 1: Create the SettingsModal component**

Create `src/features/aurora/modals/SettingsModal.tsx`:

```tsx
import { useState } from 'react';
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';
import { ClaudeAPIClient } from '../../../core/api/claude';
import { useGameStore } from '../../../store/gameStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const T = {
  it: {
    title: 'Impostazioni',
    apiKey: 'Chiave API di Anthropic',
    warning: '⚠️ La tua chiave API resta nel tuo browser e non viene mai inviata da nessuna parte tranne ad Anthropic.',
    testSave: 'Prova e salva',
    testing: 'Sto provando…',
    success: '✅ La chiave API è valida e salvata!',
    error: '❌ Questa chiave API non funziona. Riprova.',
    language: 'Lingua',
    italian: 'Italiano',
    english: 'Inglese',
    clear: 'Cancella progressi',
    clearDesc: 'Verranno cancellati la tua storia e tutti i progressi. La tua chiave API sarà mantenuta.',
    clearBtn: '⚠️ Cancella tutti i progressi',
    confirmTitle: 'Sei sicuro?',
    confirmDesc: 'Non si può tornare indietro.',
    cancel: 'Annulla',
    confirm: 'Conferma',
    close: 'Chiudi',
  },
  en: {
    title: 'Settings',
    apiKey: 'Anthropic API Key',
    warning: '⚠️ Your API key stays in your browser and is never sent anywhere except to Anthropic.',
    testSave: 'Test & Save',
    testing: 'Testing…',
    success: '✅ API key is valid and saved!',
    error: "❌ This API key doesn't work. Please retry.",
    language: 'Language',
    italian: 'Italian',
    english: 'English',
    clear: 'Clear Progress',
    clearDesc: 'This will delete your story and all progress. Your API key will be kept.',
    clearBtn: '⚠️ Clear All Progress',
    confirmTitle: 'Are you sure?',
    confirmDesc: 'There is no way to undo this.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
  },
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { apiKey, setApiKey, language, setLanguage, resetProgress } = useGameStore();
  const [key, setKey] = useState(apiKey ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const t = T[language];

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await new ClaudeAPIClient(key).testConnection();
      setTestResult('success');
      setApiKey(key);
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <AuroraModal open={open} onClose={onClose} dismissible maxWidth={580}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{t.title}</h2>
          <button
            onClick={onClose}
            aria-label={t.close}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--aurora-text-tertiary)', fontSize: '17px' }}
          >
            ✕
          </button>
        </div>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--aurora-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t.apiKey}</h3>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); if (testResult) setTestResult(null); }}
            placeholder="sk-ant-…"
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--aurora-glass-border)',
              borderRadius: 'var(--aurora-card-radius)',
              color: 'var(--aurora-text-primary)',
              fontFamily: 'var(--aurora-font-code)',
              fontSize: '13px',
              outline: 'none',
              marginBottom: '12px',
            }}
          />
          <div style={{ background: 'rgba(253, 224, 71, 0.08)', borderLeft: '3px solid var(--aurora-accent-amber)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '12.5px', color: 'var(--aurora-text-secondary)', marginBottom: '12px' }}>
            {t.warning}
          </div>
          {testResult === 'success' && (
            <div style={{ background: 'rgba(110, 231, 183, 0.10)', borderLeft: '3px solid var(--aurora-accent-success)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '13px', color: 'var(--aurora-text-primary)', marginBottom: '12px' }}>
              {t.success}
            </div>
          )}
          {testResult === 'error' && (
            <div style={{ background: 'rgba(253, 164, 175, 0.10)', borderLeft: '3px solid var(--aurora-accent-error)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '13px', color: 'var(--aurora-text-primary)', marginBottom: '12px' }}>
              {t.error}
            </div>
          )}
          <AuroraButton variant="primary" onClick={handleTest} disabled={!key || testing}>
            {testing ? t.testing : t.testSave}
          </AuroraButton>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--aurora-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t.language}</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['it', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: language === lang ? 'rgba(240, 171, 252, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: language === lang ? '1px solid var(--aurora-accent-pink)' : '1px solid var(--aurora-glass-border)',
                  borderRadius: 'var(--aurora-card-radius)',
                  cursor: 'pointer',
                  color: 'var(--aurora-text-primary)',
                  fontWeight: 600,
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{lang === 'it' ? '🇮🇹' : '🇬🇧'}</div>
                {lang === 'it' ? t.italian : t.english}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--aurora-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t.clear}</h3>
          <p style={{ fontSize: '13px', color: 'var(--aurora-text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>{t.clearDesc}</p>
          <AuroraButton variant="ghost" onClick={() => setConfirmOpen(true)}>{t.clearBtn}</AuroraButton>
        </section>
      </AuroraModal>

      <AuroraModal open={confirmOpen} onClose={() => setConfirmOpen(false)} dismissible maxWidth={420}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{t.confirmTitle}</h3>
        <p style={{ fontSize: '14px', color: 'var(--aurora-text-secondary)', marginBottom: '20px' }}>{t.confirmDesc}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={() => setConfirmOpen(false)}>{t.cancel}</AuroraButton>
          <AuroraButton
            variant="primary"
            onClick={() => { resetProgress(); setConfirmOpen(false); onClose(); }}
          >
            {t.confirm}
          </AuroraButton>
        </div>
      </AuroraModal>
    </>
  );
}
```

- [ ] **Step 2: Wire SettingsModal into AuroraApp**

In `AuroraApp.tsx`, add import:
```tsx
import { SettingsModal } from './modals/SettingsModal';
```

Find the `_settingsOpen` state variable (was prefixed with underscore as unused). Rename to `settingsOpen`:

```tsx
const [settingsOpen, setSettingsOpen] = useState(false);
```

After the closing `</Workspace>` tag (the Workspace returns a single root element; wrap in fragment):

Change the return to:

```tsx
return (
  <>
    <Workspace
      topBar={...}
      mainArea={...}
      rightPanel={...}
      bottomBar={...}
    />
    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
  </>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/features/aurora/modals/SettingsModal.tsx src/features/aurora/AuroraApp.tsx
git commit -m "feat(aurora): add SettingsModal and wire to AuroraApp"
```

## Task 23: MapErrorModal

**Files:**
- Create: `src/features/aurora/modals/MapErrorModal.tsx`

- [ ] **Step 1: Create the MapErrorModal**

Create `src/features/aurora/modals/MapErrorModal.tsx`:

```tsx
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface MapErrorModalProps {
  open: boolean;
  language: 'it' | 'en';
  onRetry: () => void;
  onOpenSettings: () => void;
}

const T = {
  it: {
    title: 'Ops! La mappa non è arrivata.',
    body: 'Qualcosa è andato storto. Controlla la chiave API e la connessione, poi riprova.',
    retry: 'Riprova',
    settings: 'Apri impostazioni',
  },
  en: {
    title: 'Oops! The map did not arrive.',
    body: 'Something went wrong. Check your API key and connection, then try again.',
    retry: 'Try Again',
    settings: 'Open Settings',
  },
};

export function MapErrorModal({ open, language, onRetry, onOpenSettings }: MapErrorModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={460}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌧️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{t.title}</h2>
        <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>{t.body}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={onOpenSettings}>{t.settings}</AuroraButton>
          <AuroraButton variant="primary" onClick={onRetry}>{t.retry}</AuroraButton>
        </div>
      </div>
    </AuroraModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/modals/MapErrorModal.tsx
git commit -m "feat(aurora): add MapErrorModal"
```

## Task 24: WrongOutputModal

**Files:**
- Create: `src/features/aurora/modals/WrongOutputModal.tsx`

- [ ] **Step 1: Create the WrongOutputModal**

Create `src/features/aurora/modals/WrongOutputModal.tsx`:

```tsx
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface WrongOutputModalProps {
  open: boolean;
  explanation: string;
  expected: string;
  actual: string;
  language: 'it' | 'en';
  onTryAgain: () => void;
  onGetHint: () => void;
}

const T = {
  it: {
    title: '🤔 Non del tutto giusto!',
    expected: 'Atteso',
    actual: 'Ottenuto',
    tryAgain: 'Riprova',
    hint: 'Dammi un aiuto',
  },
  en: {
    title: '🤔 Not quite right!',
    expected: 'Expected',
    actual: 'You got',
    tryAgain: 'Try Again',
    hint: 'Give me a hint',
  },
};

export function WrongOutputModal({
  open, explanation, expected, actual, language, onTryAgain, onGetHint,
}: WrongOutputModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={onTryAgain} dismissible maxWidth={500}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>{t.title}</h2>
      <p style={{ color: 'var(--aurora-text-primary)', lineHeight: 1.5, marginBottom: '18px' }}>{explanation}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(110, 231, 183, 0.10)', borderLeft: '3px solid var(--aurora-accent-success)', padding: '10px 12px', borderRadius: 'var(--aurora-card-radius)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-success)', marginBottom: '4px' }}>{t.expected}</div>
          <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '13px' }}>{expected}</div>
        </div>
        <div style={{ background: 'rgba(253, 164, 175, 0.10)', borderLeft: '3px solid var(--aurora-accent-error)', padding: '10px 12px', borderRadius: 'var(--aurora-card-radius)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-error)', marginBottom: '4px' }}>{t.actual}</div>
          <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '13px' }}>{actual}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <AuroraButton variant="ghost" onClick={onGetHint}>{t.hint}</AuroraButton>
        <AuroraButton variant="primary" onClick={onTryAgain}>{t.tryAgain}</AuroraButton>
      </div>
    </AuroraModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/modals/WrongOutputModal.tsx
git commit -m "feat(aurora): add WrongOutputModal"
```

## Task 25: GameCompleteModal

**Files:**
- Create: `src/features/aurora/modals/GameCompleteModal.tsx`

- [ ] **Step 1: Create the GameCompleteModal**

Create `src/features/aurora/modals/GameCompleteModal.tsx`:

```tsx
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface GameCompleteModalProps {
  open: boolean;
  totalStars: number;
  language: 'it' | 'en';
  onRestart: () => void;
  onClose: () => void;
}

const T = {
  it: {
    title: 'Hai finito l\'avventura!',
    body: 'Sei arrivato fino in fondo. Sei un vero codinatore!',
    restart: 'Nuova avventura',
    close: 'Chiudi',
    stars: 'stelle in totale',
  },
  en: {
    title: 'You finished the adventure!',
    body: 'You reached the end. You are a real Codinator!',
    restart: 'New adventure',
    close: 'Close',
    stars: 'stars total',
  },
};

export function GameCompleteModal({ open, totalStars, language, onRestart, onClose }: GameCompleteModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={onClose} dismissible maxWidth={520}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>{t.title}</h2>
        <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>{t.body}</p>
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--aurora-accent-amber)', textShadow: '0 0 18px rgba(253, 224, 71, 0.5)', marginBottom: '26px' }}>
          ⭐ {totalStars} {t.stars}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={onClose}>{t.close}</AuroraButton>
          <AuroraButton variant="primary" onClick={onRestart}>{t.restart}</AuroraButton>
        </div>
      </div>
    </AuroraModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/modals/GameCompleteModal.tsx
git commit -m "feat(aurora): add GameCompleteModal"
```

---

# Phase H — Branch + Success popup

End-of-phase state: the BranchSuccessPopup combines success feedback and branch selection in one moment.

## Task 26: BranchSuccessPopup

**Files:**
- Create: `src/features/aurora/modals/BranchSuccessPopup.tsx`

- [ ] **Step 1: Create the BranchSuccessPopup**

Create `src/features/aurora/modals/BranchSuccessPopup.tsx`:

```tsx
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import type { Element } from '../../../types/game';

interface BranchSuccessPopupProps {
  open: boolean;
  stars: number;
  explanation: string;
  narrativeBridge: string;
  branches: Element[];
  language: 'it' | 'en';
  onPick: (element: Element) => void;
}

const T = {
  it: { choose: 'Cosa scegli ora?' },
  en: { choose: 'What do you choose now?' },
};

export function BranchSuccessPopup({
  open, stars, explanation, narrativeBridge, branches, language, onPick,
}: BranchSuccessPopupProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={640}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '6px' }}>🎉</div>
        <div style={{ fontSize: '24px', letterSpacing: '4px', color: 'var(--aurora-accent-amber)', textShadow: '0 0 14px rgba(253, 224, 71, 0.6)', marginBottom: '10px' }}>
          {Array.from({ length: 3 }).map((_, i) => (i < stars ? '⭐' : '☆')).join('')}
        </div>
        <p style={{ color: 'var(--aurora-text-primary)', fontSize: '14.5px', marginBottom: '14px', lineHeight: 1.5 }}>{explanation}</p>
        <div style={{ background: 'rgba(167, 139, 250, 0.10)', borderLeft: '3px solid var(--aurora-accent-purple)', padding: '12px 16px', borderRadius: 'var(--aurora-card-radius)', textAlign: 'left', marginBottom: '20px', color: 'var(--aurora-text-primary)', lineHeight: 1.5 }}>
          {narrativeBridge}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-pink)', marginBottom: '10px' }}>{t.choose}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {branches.map((b, i) => (
            <button
              key={i}
              onClick={() => onPick(b)}
              style={{
                background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.30), rgba(240, 171, 252, 0.30))',
                border: '1px solid rgba(167, 139, 250, 0.50)',
                borderRadius: '12px',
                padding: '14px 18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--aurora-text-primary)',
                minWidth: '110px',
              }}
            >
              <div style={{ fontSize: '32px' }}>{b.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{b.name}</div>
            </button>
          ))}
        </div>
      </div>
    </AuroraModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/aurora/modals/BranchSuccessPopup.tsx
git commit -m "feat(aurora): add BranchSuccessPopup (success + branch in one)"
```

---

# Phase I — Full integration

End-of-phase state: AuroraApp is feature-complete. Pressing run, getting feedback (right or wrong), advancing through branches, finishing the game all work in the new workspace.

## Task 27: Integrate all modals + game loop into AuroraApp

This is the biggest task in the plan. It wires every modal into the AuroraApp state machine and implements the full game loop in the new UI.

**Files:**
- Modify: `src/features/aurora/AuroraApp.tsx`

- [ ] **Step 1: Overwrite AuroraApp with the full implementation**

Overwrite `src/features/aurora/AuroraApp.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { ProblemCard } from './workspace/ProblemCard';
import { EditorPane } from './workspace/EditorPane';
import { RunControls } from './workspace/RunControls';
import { RightPanel } from './workspace/RightPanel';
import { HelpPanel } from './workspace/HelpPanel';
import { ExecutionPanel } from './workspace/ExecutionPanel';
import { MapBar } from './workspace/MapBar';
import { WelcomeStoryModal } from './modals/WelcomeStoryModal';
import { SettingsModal } from './modals/SettingsModal';
import { MapErrorModal } from './modals/MapErrorModal';
import { WrongOutputModal } from './modals/WrongOutputModal';
import { GameCompleteModal } from './modals/GameCompleteModal';
import { BranchSuccessPopup } from './modals/BranchSuccessPopup';
import { useGameStore } from '../../store/gameStore';
import { useClaudeAPI } from '../../core/api/useClaudeAPI';
import { parseWithErrors, execute, type ParseError } from '../../core/language';
import type { Element } from '../../types/game';

const STEP_DURATION_MS = 1500;

type Mode = 'idle' | 'executing' | 'awaiting-rating' | 'celebrating' | 'wrong-output' | 'gen-error' | 'game-complete';

export function AuroraApp() {
  const {
    currentProblem, currentCode, setCode,
    currentLevel, stars, language, completedLevels, chosenElements,
    initialStory, mapStructure,
    setStory, setMapStructure, setProblem, selectElement, completeLevel,
  } = useGameStore();
  const apiClient = useClaudeAPI();

  const [mode, setMode] = useState<Mode>('idle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(!initialStory);

  // Execution-animation state
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<ReturnType<typeof execute>['steps']>([]);

  // Outcome state
  const [rating, setRating] = useState<{ stars: number; explanation: string; narrativeBridge: string } | null>(null);
  const [wrongOutput, setWrongOutput] = useState<{ explanation: string; expected: string; actual: string } | null>(null);

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const branches = mapStructure[completedLevels.length]?.branches ?? [];

  // Step the animation when executing
  useEffect(() => {
    if (mode !== 'executing') return;
    if (stepIndex >= steps.length) {
      setHighlightedLine(null);
      validateAndRate();
      return;
    }
    const step = steps[stepIndex];
    setHighlightedLine(step.line);
    const timer = setTimeout(() => {
      if (step.output) setOutput((o) => (o ? `${o}\n${step.output}` : step.output!));
      setVariables(step.variables);
      setStepIndex((i) => i + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stepIndex, steps]);

  const handleStorySubmit = async (story: string) => {
    setStory(story);
    setWelcomeOpen(false);
    if (!apiClient) return;
    try {
      const { mapStructure: ms } = await apiClient.generateMap({ story, language });
      if (!Array.isArray(ms) || ms.length === 0) throw new Error('empty');
      setMapStructure(ms);
    } catch {
      setMode('gen-error');
    }
  };

  const handleStoryIdeas = async () => {
    if (!apiClient) return [];
    const { ideas } = await apiClient.generateStoryIdeas({ language });
    return ideas;
  };

  const handleBranchPick = async (element: Element) => {
    if (!apiClient) return;
    selectElement(element);
    setRating(null);
    setMode('idle');
    setOutput('');
    setVariables({});
    try {
      const problem = await apiClient.generateProblem({
        story: initialStory,
        chosenElements: [...chosenElements, element],
        level: currentLevel + 1,
        language,
      });
      setProblem(problem);
    } catch (err) {
      console.error('Failed to generate problem', err);
    }
  };

  const handleRun = () => {
    if (mode !== 'idle' || !currentProblem) return;
    setHint(null);
    setRuntimeError(null);
    setOutput('');
    setVariables({});
    setStepIndex(0);

    const { tree, errors } = parseWithErrors(currentCode);
    setParseErrors(errors);
    if (errors.length > 0) return;

    const result = execute(tree, currentCode);
    if (result.error) {
      setRuntimeError({ message: result.error.message, line: result.error.line });
      return;
    }
    setSteps(result.steps);
    setMode('executing');
  };

  const validateAndRate = async () => {
    if (!currentProblem) { setMode('idle'); return; }
    const actual = output.trim();
    const expected = currentProblem.expectedOutput.trim();
    if (actual !== expected) {
      setMode('awaiting-rating');
      if (!apiClient) {
        setWrongOutput({
          explanation: language === 'it' ? "Il risultato non è quello atteso." : "The result doesn't match.",
          expected, actual,
        });
        setMode('wrong-output');
        return;
      }
      try {
        const { explanation } = await apiClient.analyzeError({
          problem: currentProblem.narrative,
          code: currentCode,
          expectedOutput: expected,
          actualOutput: actual,
          language,
        });
        setWrongOutput({ explanation, expected, actual });
      } catch {
        setWrongOutput({
          explanation: language === 'it' ? "Il risultato non è quello atteso." : "The result doesn't match.",
          expected, actual,
        });
      }
      setMode('wrong-output');
      return;
    }

    // Correct
    setMode('awaiting-rating');
    if (!apiClient) {
      const fallback = { stars: 3, explanation: language === 'it' ? 'Ottimo!' : 'Great job!', narrativeBridge: '...' };
      completeLevel(currentLevel, fallback.stars);
      setRating(fallback);
      if (currentLevel >= 10) setMode('game-complete'); else setMode('celebrating');
      return;
    }
    try {
      const r = await apiClient.rateCode({
        story: initialStory,
        problem: currentProblem.narrative,
        code: currentCode,
        level: currentLevel,
        chosenElement: chosenElements[chosenElements.length - 1] ?? { emoji: '⭐', name: 'star' },
        language,
      });
      completeLevel(currentLevel, r.stars);
      setRating(r);
      if (currentLevel >= 10) setMode('game-complete'); else setMode('celebrating');
    } catch {
      const fallback = { stars: 3, explanation: language === 'it' ? 'Ottimo!' : 'Great job!', narrativeBridge: '...' };
      completeLevel(currentLevel, fallback.stars);
      setRating(fallback);
      if (currentLevel >= 10) setMode('game-complete'); else setMode('celebrating');
    }
  };

  const handleHelp = async () => {
    if (!apiClient || !currentProblem) return;
    setHintLoading(true);
    try {
      const { hint: text } = await apiClient.generateHint({
        problem: currentProblem.narrative, code: currentCode, language,
      });
      setHint(text);
    } catch {
      setHint(language === 'it' ? 'Riprova a leggere il problema!' : 'Try reading the problem again!');
    } finally {
      setHintLoading(false);
    }
  };

  const handleWrongRetry = () => {
    setWrongOutput(null);
    setMode('idle');
  };

  const handleRestart = () => {
    useGameStore.getState().resetProgress();
    setMode('idle');
    setRating(null);
    setWelcomeOpen(true);
  };

  return (
    <>
      <Workspace
        topBar={
          <TopBar
            level={currentLevel}
            totalLevels={10}
            stars={totalStars}
            language={language}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        }
        mainArea={
          <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
            {currentProblem ? (
              <ProblemCard
                narrative={currentProblem.narrative}
                expectedOutput={currentProblem.expectedOutput}
                language={language}
              />
            ) : (
              <div style={{ color: 'var(--aurora-text-tertiary)' }}>
                {language === 'it' ? 'Scegli un elemento sulla mappa per iniziare un livello.' : 'Pick an element on the map to start a level.'}
              </div>
            )}
            <EditorPane
              code={currentCode}
              onChange={setCode}
              language={language}
              highlightedLine={highlightedLine}
              readOnly={mode === 'executing'}
              parseErrors={parseErrors}
              runtimeError={runtimeError}
            />
            {hint && (
              <div style={{ background: 'rgba(253, 224, 71, 0.10)', border: '1px solid rgba(253, 224, 71, 0.25)', borderLeft: '3px solid var(--aurora-accent-amber)', borderRadius: 'var(--aurora-card-radius)', padding: '10px 14px', color: 'var(--aurora-text-primary)', fontSize: '13.5px', lineHeight: 1.5 }}>
                💡 {hint}
              </div>
            )}
            <RunControls
              onRun={handleRun}
              onHelp={handleHelp}
              running={mode === 'executing' || mode === 'awaiting-rating'}
              helpLoading={hintLoading}
              language={language}
            />
          </GlassPane>
        }
        rightPanel={
          <RightPanel
            mode={mode === 'executing' ? 'execution' : 'help'}
            help={<HelpPanel language={language} currentLevel={Math.max(1, currentLevel)} />}
            execution={<ExecutionPanel output={output} variables={variables} language={language} />}
          />
        }
        bottomBar={
          <BottomBar>
            <MapBar completedLevels={completedLevels} currentLevel={currentLevel} chosenElements={chosenElements} language={language} />
          </BottomBar>
        }
      />

      <WelcomeStoryModal open={welcomeOpen} language={language} onSubmit={handleStorySubmit} onGetIdeas={apiClient ? handleStoryIdeas : undefined} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MapErrorModal open={mode === 'gen-error'} language={language} onRetry={() => { setMode('idle'); handleStorySubmit(initialStory); }} onOpenSettings={() => { setMode('idle'); setSettingsOpen(true); }} />
      {wrongOutput && (
        <WrongOutputModal
          open={mode === 'wrong-output'}
          explanation={wrongOutput.explanation}
          expected={wrongOutput.expected}
          actual={wrongOutput.actual}
          language={language}
          onTryAgain={handleWrongRetry}
          onGetHint={() => { handleWrongRetry(); handleHelp(); }}
        />
      )}
      {rating && mode === 'celebrating' && (
        <BranchSuccessPopup
          open
          stars={rating.stars}
          explanation={rating.explanation}
          narrativeBridge={rating.narrativeBridge}
          branches={branches}
          language={language}
          onPick={handleBranchPick}
        />
      )}
      <GameCompleteModal open={mode === 'game-complete'} totalStars={totalStars} language={language} onRestart={handleRestart} onClose={() => setMode('idle')} />
    </>
  );
}
```

- [ ] **Step 2: Test manually**

Run: `npm run dev`. Visit `http://localhost:5173/codino/?ui=aurora`.
- Confirm the welcome modal appears on first visit
- Submit a story (with API key set)
- Pick a branch, write code, run, see success
- Pick again, repeat
- Stop the dev server.

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: all pass (existing tests + new aurora tests).

- [ ] **Step 4: Commit**

```bash
git add src/features/aurora/AuroraApp.tsx
git commit -m "feat(aurora): wire all modals and full game loop into AuroraApp"
```

## Task 28: DesktopOnlyGuard

**Files:**
- Create: `src/features/aurora/DesktopOnlyGuard.tsx`
- Modify: `src/features/aurora/AuroraApp.tsx`

- [ ] **Step 1: Create the DesktopOnlyGuard**

Create `src/features/aurora/DesktopOnlyGuard.tsx`:

```tsx
import { useEffect, useState, type ReactNode } from 'react';

interface DesktopOnlyGuardProps {
  language: 'it' | 'en';
  children: ReactNode;
}

const MIN_WIDTH = 900;

const T = {
  it: {
    title: 'Codino richiede uno schermo grande',
    body: 'Per programmare hai bisogno di una tastiera. Apri Codino su un computer o un laptop.',
  },
  en: {
    title: 'Codino needs a larger screen',
    body: 'You need a keyboard to write code. Open Codino on a desktop or laptop.',
  },
};

export function DesktopOnlyGuard({ language, children }: DesktopOnlyGuardProps) {
  const [w, setW] = useState(typeof window === 'undefined' ? 1024 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (w < MIN_WIDTH) {
    const t = T[language];
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div
          style={{
            background: 'var(--aurora-glass-elevated)',
            border: '1px solid var(--aurora-glass-border)',
            backdropFilter: 'var(--aurora-glass-blur)',
            WebkitBackdropFilter: 'var(--aurora-glass-blur)',
            borderRadius: 'var(--aurora-modal-radius)',
            padding: '32px',
            color: 'var(--aurora-text-primary)',
            textAlign: 'center',
            maxWidth: '420px',
            boxShadow: 'var(--aurora-shadow-glass)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💻</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{t.title}</h2>
          <p style={{ color: 'var(--aurora-text-secondary)', lineHeight: 1.5 }}>{t.body}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Wrap AuroraApp's return in DesktopOnlyGuard**

In `AuroraApp.tsx`, add import:

```tsx
import { DesktopOnlyGuard } from './DesktopOnlyGuard';
```

Wrap the entire return value of `AuroraApp`:

```tsx
return (
  <DesktopOnlyGuard language={language}>
    <>
      {/* existing workspace + modals */}
    </>
  </DesktopOnlyGuard>
);
```

- [ ] **Step 3: Verify manually**

Run: `npm run dev`. Resize window narrower than 900px. Confirm the desktop-only message appears. Resize wider — confirm the workspace returns.
Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/features/aurora/DesktopOnlyGuard.tsx src/features/aurora/AuroraApp.tsx
git commit -m "feat(aurora): add DesktopOnlyGuard for narrow viewports"
```

---

# Phase J — Cutover

End-of-phase state: AuroraApp is the default. Old screens deleted. The `?ui=aurora` feature flag is removed.

## Task 29: Make Aurora the default in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Replace App.tsx with the Aurora-only version**

Overwrite `src/App.tsx` with:

```tsx
import { AuroraApp } from './features/aurora/AuroraApp';

function App() {
  return <AuroraApp />;
}

export default App;
```

- [ ] **Step 2: Always apply aurora-mode body class**

Edit `src/main.tsx`. Replace the conditional block:

```tsx
if (new URLSearchParams(window.location.search).get('ui') === 'aurora') {
  document.body.classList.add('aurora-mode');
}
```

with:

```tsx
document.body.classList.add('aurora-mode');
```

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: many tests fail because they assume the old App structure (e.g., `tests/unit/App.test.tsx`).

This is expected. Continue to Task 30 to update tests and delete old code.

- [ ] **Step 4: Commit (failing-tests checkpoint)**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat(aurora): make Aurora workspace the default"
```

## Task 30: Delete old screen components

**Files:**
- Delete: many — listed in the File Structure section above

- [ ] **Step 1: Remove old screen components**

```bash
git rm \
  src/components/ui/Button.tsx \
  src/components/ui/Card.tsx \
  src/components/ui/Modal.tsx \
  src/components/layout/AppLayout.tsx \
  src/components/layout/Navbar.tsx \
  src/features/story/WelcomeScreen.tsx \
  src/features/story/StoryInput.tsx \
  src/features/story/GeneratingScreen.tsx \
  src/features/story/MapErrorScreen.tsx \
  src/features/map/MapView.tsx \
  src/features/map/MapNode.tsx \
  src/features/map/MapPath.tsx \
  src/features/map/MapBranch.tsx \
  src/features/map/useMapLayout.ts \
  src/features/editor/EditorView.tsx \
  src/features/editor/ProblemPanel.tsx \
  src/features/execution/ErrorDisplay.tsx \
  src/features/execution/ExecutionAnimator.tsx \
  src/features/execution/OutputPanel.tsx \
  src/features/execution/SuccessScreen.tsx \
  src/features/execution/VariablesPanel.tsx \
  src/features/settings/SettingsView.tsx \
  src/features/settings/ApiKeyInput.tsx
```

- [ ] **Step 2: Remove empty directories if any**

```bash
find src/components/layout src/components/ui src/features/story src/features/map src/features/execution src/features/settings -type d -empty -delete 2>/dev/null
```

- [ ] **Step 3: Update App.test.tsx**

Read `tests/unit/App.test.tsx`. Replace it with a basic smoke test:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  it('renders the Aurora workspace (or the welcome modal at minimum)', () => {
    render(<App />);
    // On first load with no story, the welcome modal heading should appear.
    expect(
      screen.getByText(/Codino|Benvenuto in Codino|Welcome to Codino/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Update Playwright E2E specs to match the new UI**

Read `tests/e2e/app.spec.ts`. Replace with:

```ts
import { test, expect } from '@playwright/test';

test('homepage shows the welcome modal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/i)).toBeVisible();
});
```

Read `tests/e2e/settings.spec.ts`. Replace with:

```ts
import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Dismiss the welcome modal? It can't be dismissed; instead, set a story via localStorage.
    await page.evaluate(() => {
      localStorage.setItem('codino_progress', JSON.stringify({
        initialStory: 'A brave knight',
        currentLevel: 0,
        completedLevels: [],
        mapStructure: [],
        chosenElements: [],
        stars: {},
      }));
    });
    await page.reload();
    await page.getByRole('button', { name: /impostazioni|settings/i }).click();
  });

  test('shows API Key heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).toBeVisible();
  });

  test('shows both language options', async ({ page }) => {
    await expect(page.getByText(/Italiano|Italian/)).toBeVisible();
    await expect(page.getByText(/English|Inglese/)).toBeVisible();
  });

  test('closes via the X button', async ({ page }) => {
    await page.getByRole('button', { name: /close|chiudi/i }).click();
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).not.toBeVisible();
  });
});
```

Read `tests/e2e/game-flow.spec.ts`. Replace with a simplified version:

```ts
import { test, expect } from '@playwright/test';

test('story input modal appears for new players', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Tell your adventure|Racconta la tua avventura/i)).toBeVisible();
  const textarea = page.getByRole('textbox');
  await textarea.fill('A brave knight searches for treasure');
  await expect(page.getByRole('button', { name: /Start adventure|Inizia/i })).toBeEnabled();
});
```

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: pass.

Run: `npx playwright test`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(aurora): delete legacy screen components; update tests for new UI"
```

---

# Phase K — Spec updates

End-of-phase state: every affected capability spec reflects the post-Aurora state. The forward-looking redesign doc is archived.

## Task 31: Create specs/visual-system.md

**Files:**
- Create: `specs/visual-system.md`

- [ ] **Step 1: Create visual-system.md**

Create `specs/visual-system.md`:

```markdown
# Visual system

The shared visual language for every Codino surface: background, glass, color, typography, geometry. Lives globally in `src/styles/aurora.css` as CSS custom properties consumed by components via inline styles.

## Decisions

### Aurora background lives on `<body>`
A multi-radial gradient (indigo violet pink magenta) attached to `<body>` via the `.aurora-mode` class. `background-attachment: fixed` keeps it stationary while content scrolls. The Aurora-mode class is set unconditionally in `src/main.tsx`.

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
Loaded from Google Fonts via a `<link>` in `index.html` with `display=swap`. Both are open-source. Lexend was chosen for legibility-with-personality (designed for reading proficiency, but with distinctive enough letterforms to feel playful). JetBrains Mono for code because it disambiguates 0/O/1/l/I and renders Italian Codino keywords with strong rhythm.

### Label = small-caps treatment
Section markers throughout the UI use a single Label component: 11 px, weight 700, uppercase, letter-spacing 0.9 px. This is the visual rhythm that ties the whole UI together.

### Two button variants
- Primary: purple→pink gradient. Used for the single highest-affordance action on each surface.
- Ghost: translucent with hairline border. Used for everything else.

There is no third variant.

## Invariants

INV-01: All Codino UI components must source colors via `var(--aurora-*)` custom properties. Hard-coded hex values outside `aurora.css` violate the discipline.

INV-02: Each accent color appears in only its assigned role. Reusing `--aurora-accent-success` for non-output green text is forbidden.

INV-03: Every pane and modal uses one of the two glass intensities (`--aurora-glass-surface` or `--aurora-glass-elevated`); no bespoke fills.

INV-04: All button surfaces use the `AuroraButton` component. There are no inline `<button>` elements except for icon-only controls (close ×, gear icon ⚙️).

INV-05: All section markers use the `Label` component. Inline `<h3>` or `<span style="...">` that duplicate the small-caps treatment violate INV-05.

INV-06: The Aurora gradient is loaded only when `body` has the `aurora-mode` class. (After Phase J this class is always present; the conditional is retained for tests and future feature flags.)
```

- [ ] **Step 2: Update specs/README.md to include visual-system.md**

Edit `specs/README.md`. Add to the capabilities list, after `settings.md`:

```markdown
- [visual-system.md](visual-system.md) — Aurora background, glass tokens, color roles, typography, buttons, labels (post-redesign)
```

- [ ] **Step 3: Commit**

```bash
git add specs/visual-system.md specs/README.md
git commit -m "docs(specs): add visual-system capability spec"
```

## Task 32: Update map-visualization.md

**Files:**
- Modify: `specs/map-visualization.md`

- [ ] **Step 1: Rewrite map-visualization.md to reflect the new bottom-bar approach**

Overwrite `specs/map-visualization.md` with:

```markdown
# Map visualization

The map is a horizontal strip at the bottom of the workspace showing the player's progress through 10 levels. It is not interactive — branch selection happens via the floating success popup, not by clicking nodes. The map is a status indicator, not a navigation control.

## Decisions

### Horizontal strip in the workspace BottomBar
The map is rendered as 10 nodes connected by hairline lines, spread across the full bottom bar width (~1000 px). Each node is ~22 px (current node 27 px), with the chosen-element emoji for completed levels.

### Three node states, all visually distinct
- **Completed**: gradient purple→pink circle with the chosen emoji; soft purple glow
- **Current**: gradient amber→orange circle with the level number; pulsing amber glow; slightly larger
- **Locked**: translucent white circle with the level number; no glow

The current node is defined as `currentLevel + 1` (the next level to play). When `currentLevel === 10`, no current node is shown — the game is complete.

### Map is NOT clickable
Branch selection happens via the floating popup that appears after a level is completed. The map nodes themselves have no `onClick` handlers. This is a deliberate departure from the original design where map nodes were the navigation primary.

### Data sources from the store
`completedLevels`, `currentLevel`, and `chosenElements` are all read from `useGameStore`. The component is pure presentation; it has no local state.

## Invariants

INV-01: Exactly 10 nodes are rendered, one per level.

INV-02: The chosen-element emoji on a completed node comes from `chosenElements[levelIndex]`.

INV-03: At most one node is rendered with the "current" state at any time.

INV-04: The map is not interactive. No node has `onClick`, `cursor: pointer`, or any other click affordance.

INV-05: When `currentLevel === 10` (game complete), the level-10 node shows 🏁 with the "completed" style if it is in `completedLevels`, otherwise as locked.
```

- [ ] **Step 2: Commit**

```bash
git add specs/map-visualization.md
git commit -m "docs(specs): update map-visualization.md for the Aurora bottom-bar approach"
```

## Task 33: Update editor.md

**Files:**
- Modify: `specs/editor.md`

- [ ] **Step 1: Rewrite editor.md to reflect the EditorPane embedding**

Overwrite `specs/editor.md` with:

```markdown
# Editor

The editor capability covers the code-editing experience inside the workspace's main area: CodeMirror integration, syntax highlighting, line highlighting, autocomplete, and inline error feedback.

## Decisions

### CodeMirror 6 with a Lezer grammar
The editor uses CodeMirror 6 (`src/features/editor/CodeEditor.tsx`) with the Lezer-generated Codino parser (`src/core/language/parser.ts`). One parser drives both execution and syntax highlighting — no duplicate token logic.

### EditorPane wraps the CodeEditor with inline error slots
`src/features/aurora/workspace/EditorPane.tsx` composes:
- The Label "Editor"
- CodeEditor itself
- Optional `ParseErrorCard` shown when `parseErrors.length > 0`
- Optional `RuntimeErrorCard` shown when `runtimeError` is non-null

Only the first parse error is shown; further errors are typically cascaded from the first and would confuse a 7-year-old. The implementation can revisit this if testing shows the first error isn't always the most actionable.

### Read-only during execution
While `mode === 'executing'`, the editor receives `readOnly=true`. CodeMirror disables typing; the cursor is hidden; line highlighting still works.

### Line highlighting via StateEffect
The current execution step's line number is dispatched as a `setHighlightedLine` StateEffect. A StateField applies a `Decoration.line` with the `.cm-executionLine` class. Dispatching `null` clears it.

### Autocomplete for keywords
`@codemirror/autocomplete` registers a single completion source that triggers after 2 uppercase characters (or explicit Ctrl+Space). Both Italian and English keywords are offered; prefix matching naturally separates them (`SCR` → only Italian, `WR` → only English).

### Syntax highlighting from styleTags
`grammar.ts` attaches Lezer style tags to grammar nodes: keywords → blue, numbers → amber, strings → green, identifiers → pink, operators → muted. These map to the Aurora accent palette via `--aurora-code-*` tokens.

### Editor canvas has its own dark background
The CodeMirror canvas is a darker translucent surface (`rgba(0, 0, 0, 0.36)`) inside the EditorPane's glass surface. This gives the code area visual focus.

## Invariants

INV-01: The CodeEditor instance is created once per mount and destroyed on unmount. It is never recreated in response to prop changes.

INV-02: Syntax highlighting derives from the Lezer grammar via styleTags. There is no separate highlighting regex or second tokenizer.

INV-03: Read-only mode (`readOnly=true`) suppresses both editing and the `onChange` callback.

INV-04: The editor never reflows to accommodate error cards. Cards appear *below* the editor; they do not change its size.

INV-05: Only the first parse error is shown in the UI (the rest are suppressed). The complete error list is still returned by `parseWithErrors`.
```

- [ ] **Step 2: Commit**

```bash
git add specs/editor.md
git commit -m "docs(specs): update editor.md for EditorPane and inline error cards"
```

## Task 34: Update story-onboarding.md

**Files:**
- Modify: `specs/story-onboarding.md`

- [ ] **Step 1: Rewrite story-onboarding.md**

Overwrite `specs/story-onboarding.md` with:

```markdown
# Story / Onboarding

A first-time player creates a story through the WelcomeStoryModal, which appears as a glass overlay over the workspace. The workspace is rendered underneath in its empty state; submitting the story closes the modal, triggers map generation, and populates the map bar.

## Decisions

### Single first-launch modal
`WelcomeStoryModal` combines the previously-separate welcome screen and story input into one modal. It appears whenever `initialStory` is empty (first launch, after Clear Progress).

### No dismiss before submitting
The modal has no close button, no backdrop click, no Escape. The player must enter a story to proceed. This keeps the empty-workspace state from being reachable — the workspace is only shown once the game is set up.

### Story is capped at 500 characters
The textarea has `maxLength={500}` for hard browser-level enforcement; `validateStoryInput` in the API layer also enforces it before any AI call. Counter ("123 / 500") shown below the textarea.

### Example chips and AI ideas
Three static bilingual example chips are always shown. When an API client is available, a "Give me ideas 💡" link appears next to the counter; clicking it calls `generateStoryIdeas` and renders the returned ideas as green chips above the static purple example chips.

### Generation phase
After story submission, `generateMap` runs asynchronously. The modal closes immediately so the player sees the workspace assembling. The map bar shows all-locked nodes until generation completes; an animated shimmer indicates "generating…" (decision deferred to implementation: the simplest approach is to render nothing — the locked map already communicates "not ready").

### Error path
If `generateMap` fails (network, invalid key, malformed response), `MapErrorModal` appears with "Try Again" and "Open Settings" actions. Retry calls `handleStorySubmit(initialStory)` again.

## Invariants

INV-01: WelcomeStoryModal appears whenever the store has no `initialStory` and no `currentProblem`. It is the only path to set an `initialStory`.

INV-02: The story submitted to `onSubmit` is `.trim()`-ed.

INV-03: The submit button is disabled until the textarea contains non-whitespace.

INV-04: 500 characters is enforced at both the browser level (textarea maxLength) and the API layer (validateStoryInput).

INV-05: Map generation failure routes to `MapErrorModal`, never to a silently-empty map.

INV-06: The "Give me ideas" button is hidden when `apiClient` is null.
```

- [ ] **Step 2: Commit**

```bash
git add specs/story-onboarding.md
git commit -m "docs(specs): update story-onboarding.md for single first-launch modal"
```

## Task 35: Update execution-engine.md

**Files:**
- Modify: `specs/execution-engine.md`

- [ ] **Step 1: Rewrite execution-engine.md**

Overwrite `specs/execution-engine.md` with:

```markdown
# Execution Engine

The execution engine orchestrates parsing, execution, validation, and the in-workspace state transitions between the editor and the right-panel modes.

## Pipeline

```
Player presses RUN
  ↓
1. Parse + syntax check     parseWithErrors(code)
   → if errors: show ParseErrorCard inline; mode stays 'idle' (stop here)
  ↓
2. Execute                  execute(tree, code)
   → if RuntimeError: show RuntimeErrorCard inline; mode stays 'idle' (stop here)
  ↓
3. Animate                  mode → 'executing'; right panel crossfades to ExecutionPanel
                            Each ExecutionStep displayed for 1500 ms
                            Editor frozen (readOnly), current line highlighted
                            Output and variables update incrementally in the panel
  ↓
4. Validate                 actual.trim() === expected.trim()
   → mismatch: call analyzeError (Haiku) → WrongOutputModal opens
   → match:    call rateCode (Sonnet)   → BranchSuccessPopup opens
```

## Decisions

### State machine drives the workspace
The `AuroraApp` component holds a `Mode` enum (`'idle' | 'executing' | 'awaiting-rating' | 'celebrating' | 'wrong-output' | 'gen-error' | 'game-complete'`). The right panel's visual mode is derived from this: `'execution'` only when the enum is `'executing'`; otherwise `'help'`.

### Animation pace
Each execution step is displayed for 1500 ms via the module-level constant `STEP_DURATION_MS`. The progress crossfade timing in the right panel is fixed at 300 ms regardless of step duration.

### Validation is exact string match after trim
`actualOutput.trim() === expectedOutput.trim()`. No numeric tolerance, no case folding.

### Wrong output uses Haiku
`analyzeError` runs Claude Haiku for cost-efficient explanation. Failure falls back to a generic bilingual "result doesn't match" message.

### Successful runs trigger rateCode
`rateCode` is called with the full context: story, problem, source code (not output), level, chosen element, language. The returned stars, explanation, and narrative bridge populate the BranchSuccessPopup.

### rateCode failure falls back to 3 stars
A 3-star fallback ensures a network error never blocks a child who solved the problem. The bridge text is a placeholder ("…") that the popup renders as-is.

## Invariants

INV-01: `execute()` is never called when `parseWithErrors` returned errors.

INV-02: The right panel is in `'execution'` mode if and only if `Mode === 'executing'`.

INV-03: `rateCode` and `analyzeError` receive the player's source code (`currentCode`), never the execution output.

INV-04: Output comparison trims both sides; no other normalization.

INV-05: A rateCode or analyzeError failure shows a fallback message; the player never sees an empty or broken popup.

INV-06: Editor is read-only when `Mode === 'executing'` or `Mode === 'awaiting-rating'`.
```

- [ ] **Step 2: Commit**

```bash
git add specs/execution-engine.md
git commit -m "docs(specs): update execution-engine.md for workspace state machine"
```

## Task 36: Update settings.md

**Files:**
- Modify: `specs/settings.md`

- [ ] **Step 1: Rewrite settings.md**

Overwrite `specs/settings.md` with:

```markdown
# Settings

Settings is reached via the gear icon in the workspace top bar. It opens an AuroraModal with three sections: API Key, Language, Clear Progress.

## Decisions

### One AuroraModal with three sections
API Key → Language → Clear Progress. The order reflects player priority (a missing API key blocks everything; language is the next-most-likely change; clear progress is destructive and goes last).

### Bilingual UI text via per-component language maps
Every label, button, warning, and confirmation string has `it` and `en` variants in a local map. Same pattern as WelcomeStoryModal, SettingsModal, etc. No translation library.

### Real API call to validate the key
`ClaudeAPIClient.testConnection()` sends a 1-token "Hi" message. The key is persisted to `useGameStore` only if the call succeeds. Network or auth errors → red banner, no save.

### Test result auto-clears on edit
If the player edits the API key field after a success or error banner appears, the banner clears immediately. This avoids stale "✅ saved!" messages after the player has changed the key.

### Clear Progress requires a confirmation modal
A nested AuroraModal asks "Are you sure?" / "Sei sicuro?". Confirming calls `resetProgress` (preserves language + API key per `game-state` spec); cancelling dismisses the confirmation only.

### Dismissible
Settings modal is `dismissible={true}`: ✕ button top-right, Escape key, backdrop click all close. (The confirmation sub-modal is also dismissible.)

### Close button uses bilingual aria-label
`aria-label={t.close}` — `'Close'` or `'Chiudi'`. Accessibility-aware AND testable via Playwright.

## Invariants

INV-01: An API key is persisted only after `testConnection` succeeds.

INV-02: Every string rendered in SettingsModal comes from the language map; no hardcoded literals.

INV-03: Clear Progress requires the confirmation sub-modal. `resetProgress` is never called directly from the primary modal.

INV-04: The API key input has `type="password"`. Never rendered in plaintext.

INV-05: All state read from `useGameStore`; no local copies of API key or language.
```

- [ ] **Step 2: Commit**

```bash
git add specs/settings.md
git commit -m "docs(specs): update settings.md for AuroraModal-based design"
```

## Task 37: Update project.md

**Files:**
- Modify: `specs/project.md`

- [ ] **Step 1: Update the Tech stack section in project.md to mention the new fonts**

Read `specs/project.md`. Find the "Tech stack" section. After the Tailwind CSS bullet, add:

```markdown
- **Lexend + JetBrains Mono** (Google Fonts) — Aurora typography. Lexend for UI (designed for reading proficiency, distinctive personality without being twee); JetBrains Mono for code (legibility, no ambiguous characters). Loaded via `<link>` in `index.html`.
```

Find the "Architecture" section. Append this paragraph:

```markdown
Per ADR-001, the UI is organized around a single always-on Workspace with four panes (top bar, main area with problem + editor, right panel that crossfades between Help and Execution, bottom map strip). Previously-separate screens (welcome, story input, settings, errors, success) are AuroraModal overlays; the map screen is eliminated in favor of the bottom strip.
```

- [ ] **Step 2: Commit**

```bash
git add specs/project.md
git commit -m "docs(specs): update project.md tech stack and architecture for Aurora"
```

## Task 38: Archive the redesign doc

**Files:**
- Delete: `specs/redesigns/2026-06-06-aurora-redesign.md`

- [ ] **Step 1: Delete the implementation companion**

The redesign doc was the bridge from design to implementation. Now that the capability specs reflect the post-Aurora state, the redesign doc is redundant and risks drifting.

```bash
git rm specs/redesigns/2026-06-06-aurora-redesign.md
```

- [ ] **Step 2: Remove the `redesigns/` reference from specs/README.md**

Edit `specs/README.md`. Delete the "Forward-looking design docs" section entirely.

- [ ] **Step 3: Remove the empty redesigns/ directory**

```bash
rmdir specs/redesigns 2>/dev/null
```

- [ ] **Step 4: Commit**

```bash
git add specs/README.md
git commit -m "docs(specs): archive aurora-redesign companion; capability specs now reflect current state"
```

---

# Phase L — Polish

End-of-phase state: subtle aurora drift animation, reduced-motion handling, current-node pulse — the design's small details are in place.

## Task 39: Aurora drift animation

**Files:**
- Modify: `src/styles/aurora.css`

- [ ] **Step 1: Add the drift keyframes and animation to aurora.css**

Append to `src/styles/aurora.css`:

```css
@keyframes aurora-drift {
  0%   { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%; }
  50%  { background-position: 5% 3%, 95% 97%, 52% 48%, 0% 0%; }
  100% { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%; }
}

body.aurora-mode {
  animation: aurora-drift 60s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  body.aurora-mode { animation: none; }
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`. Open `/codino/`. After 30 seconds, the background should subtly shift. The motion is so gentle it should be barely perceptible.

In DevTools, simulate `prefers-reduced-motion: reduce` and reload. The animation should be off.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/styles/aurora.css
git commit -m "feat(aurora): add subtle 60s drift animation with prefers-reduced-motion support"
```

## Task 40: Final verification — manual + automated sweep

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all unit tests pass.

- [ ] **Step 2: Run E2E**

Run: `npx playwright test`
Expected: all 3 E2E tests pass.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds, no warnings.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`. Walk through:
1. First load → Welcome modal appears
2. Submit story → modal closes, workspace visible
3. Pick a branch (popup or — if no API key — manually set localStorage state) → editor receives a problem
4. Write valid code, RUN → execution animates, success popup appears with stars
5. Pick another branch → loop continues
6. Try invalid code → ParseErrorCard appears
7. Try wrong-output code → WrongOutputModal appears
8. Open Settings → modal shows; toggle language; close
9. Clear progress → confirmation modal; confirm → welcome modal returns

Stop dev server.

- [ ] **Step 5: Final commit (no changes expected, but verify clean state)**

Run: `git status`
Expected: working tree clean.

No commit needed.

---

## Self-Review Notes (for the executor)

This plan was self-reviewed for the patterns listed in the writing-plans skill:

**Spec coverage:** Every surface in the redesign doc's "Surface inventory" is covered: TopBar (Task 9), ProblemCard (Task 12), EditorPane (Task 13), RunControls (Task 14), RightPanel (Task 18), HelpPanel (Task 16), ExecutionPanel (Task 17), MapBar (Task 20), all six modals (Tasks 21–26), inline error cards (Task 13), DesktopOnlyGuard (Task 28). Phase K covers the six spec-update tasks called out in the redesign doc plus the new visual-system.md.

**Placeholder scan:** No `TBD`, `TODO`, or "implement later" markers. Every step has explicit code, exact paths, or exact commands.

**Type consistency:** `ParseError` import, `Element` type, `ExecutionStep` from `core/language/types`, `useGameStore` shape are consistent across tasks. `mode` enum values are defined once in Task 19 and extended explicitly in Task 27. The MapBar's `data-testid` values used in tests (`node-current`, `node-done`, `node-locked`) are present in the component code.

**Scope check:** The plan is large (40 tasks across 12 phases) but each phase produces working software with a milestone commit. The dependency chain (foundation → primitives → workspace shell → main area → right panel → map → modals → integration → cutover → spec updates → polish) is strict and well-defined; tasks within a phase are mostly independent.

**Known acceptable simplifications:**
- The aurora drift animation animates `background-position`, which works because each gradient layer has its own position. CSS doesn't natively support per-layer animation of multiple radial-gradient layers, but background-position cycling produces a subtle effect that approximates "drifting aurora." This is acceptable simplicity.
- E2E tests in Phase J are reduced to smoke-level coverage. Deep E2E for every modal/popup is deferred until after the redesign ships and is being used.
- The WelcomeStoryModal example chips and AI idea chips use slightly different colors (purple vs green) to signal the source — kept simple, not over-designed.
