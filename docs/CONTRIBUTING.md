# Contributing to Codino

Thank you for your interest in contributing to Codino! This document provides guidelines for developers who want to contribute to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Adding New Features](#adding-new-features)
- [Project Architecture](#project-architecture)

## Getting Started

### Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Anthropic API Key** ([Get one](https://console.anthropic.com/))

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codino.git
   cd codino
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/alessio/codino.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment** (optional):
   ```bash
   # Create .env.local for development
   echo "VITE_ANTHROPIC_API_KEY=your-key-here" > .env.local
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

7. **Verify everything works**:
   - Open http://localhost:5173
   - Check that the app loads
   - Run tests: `npm test`

### Understanding the Codebase

Before contributing, read:
1. [specs/](../specs/) - Design specifications. The source of truth for the
   project. `specs/README.md` is the index; `specs/project.md` covers the
   overall architecture; each `specs/<capability>.md` documents one area
   of the system with the decisions and invariants that govern it.

This is a spec-driven project: specs describe what the system is and why
it is that way. Before writing code in an area, read the corresponding
spec. When you change behaviour, update the spec in the same commit.

## Development Workflow

### 1. Pick an Issue

- Browse [open issues](https://github.com/alessio/codino/issues)
- Look for labels like `good first issue` or `help wanted`
- Comment on the issue to claim it
- If no suitable issue exists, create one first to discuss

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming**:
- `feature/add-sound-effects`
- `bugfix/parser-error-handling`
- `docs/improve-readme`
- `refactor/simplify-interpreter`

### 3. Make Your Changes

- Write code following style guidelines (see below)
- Write/update tests
- Update documentation if needed
- Test thoroughly locally

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "Add sound effects for success screen

- Implement audio playback with volume control
- Add toggle for mute/unmute
- Update settings to persist audio preference
- Add tests for audio manager

Closes #123"
```

**Commit message format**:
- First line: Brief summary (50 chars max)
- Blank line
- Detailed explanation (wrap at 72 chars)
- Reference issue numbers

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

**General Rules**:
- Use TypeScript strict mode (enabled by default)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add type annotations for function parameters and return types
- Avoid `any` type (use `unknown` if needed)

**Example**:
```typescript
// ✅ Good
function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

// ❌ Avoid
function calc(x: any) {
  return x.reduce((a: any, b: any) => a + b);
}
```

### React Components

**Functional Components**:
- Use function declarations for components
- Destructure props in parameter list
- Use TypeScript interfaces for props

**Example**:
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Avoid
const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

**Hooks**:
- Follow [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- Custom hooks start with `use`
- Keep hooks at component top level

### File Organization

**Naming**:
- Components: `PascalCase.tsx` (e.g., `MapView.tsx`)
- Utilities: `camelCase.ts` (e.g., `validation.ts`)
- Types: `camelCase.ts` or part of component file
- Hooks: `use + PascalCase.ts` (e.g., `useMapLayout.ts`)

**Imports**:
- Group imports: React, third-party, local
- Use absolute paths when crossing feature boundaries
- Keep imports alphabetized within groups

**Example**:
```typescript
// React imports
import { useState, useEffect } from 'react';

// Third-party imports
import { create } from 'zustand';

// Local imports
import { MapNode } from './MapNode';
import { useGameStore } from '../../store/gameStore';
import type { Element } from '../../types/game';
```

### CSS and Styling

**Tailwind CSS**:
- Use Tailwind utility classes
- Keep className strings readable (use template literals if long)
- Prefer Tailwind over custom CSS
- Use semantic class names for complex styles

**Example**:
```typescript
// ✅ Good
<button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
  Click Me
</button>

// ✅ Also good for complex styles
const buttonClasses = `
  px-6 py-3
  bg-blue-500 hover:bg-blue-600
  text-white font-semibold
  rounded-lg shadow-md
  transition-colors duration-200
`;
<button className={buttonClasses}>Click Me</button>
```

### Comments and Documentation

**When to Comment**:
- Complex algorithms or business logic
- Non-obvious decisions or workarounds
- Public APIs and interfaces
- Regular expressions
- Magic numbers

**When NOT to Comment**:
- Obvious code (let the code speak)
- Redundant information
- Commented-out code (delete it)

**Example**:
```typescript
// ✅ Good - explains WHY
// Use 500ms delay to match child reading speed
const ANIMATION_DELAY = 500;

// Parse code with error recovery enabled
// This allows showing helpful messages for partial/invalid code
const tree = parse(code, { recover: true });

// ❌ Bad - explains WHAT (obvious from code)
// Set counter to zero
const counter = 0;
```

**JSDoc for Public APIs**:
```typescript
/**
 * Execute a Codino program from its AST.
 *
 * @param tree - The parsed syntax tree
 * @param code - Original source code (for error positions)
 * @returns Execution result with steps, output, and any errors
 */
export function execute(tree: Tree, code: string): ExecutionResult {
  // ...
}
```

## Testing

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (during development)
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Writing Tests

**Unit Tests** (Vitest):

Location: `tests/unit/`

```typescript
import { describe, it, expect } from 'vitest';
import { execute } from '../src/core/language/interpreter';

describe('Interpreter', () => {
  it('executes simple assignment', () => {
    const code = 'x = 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.x).toBe(5);
  });

  it('throws error for undefined variable', () => {
    const code = 'SCRIVI unknown';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Undefined variable');
  });
});
```

**E2E Tests** (Playwright):

Location: `tests/e2e/`

```typescript
import { test, expect } from '@playwright/test';

test('complete level flow', async ({ page }) => {
  await page.goto('/');

  // Navigate through onboarding
  await page.click('button:has-text("English")');
  await page.fill('textarea', 'A brave knight seeks treasure');
  await page.click('button:has-text("Start Adventure")');

  // Wait for map
  await expect(page.locator('svg')).toBeVisible();

  // Select first level
  await page.click('[data-level="1"]');

  // Write code
  await page.locator('.cm-content').type('x = 5\nSCRIVI x');

  // Run and verify success
  await page.click('button:has-text("RUN")');
  await expect(page.locator('text=⭐')).toBeVisible();
});
```

### Test Coverage Guidelines

Aim for:
- **Parser/Interpreter**: 90%+ (critical)
- **API validation**: 90%+ (security)
- **State management**: 80%+
- **UI components**: 60%+ (rely more on E2E)
- **E2E critical paths**: 100%

### What to Test

**Always test**:
- Core business logic (parser, interpreter)
- State management actions
- API validation and security
- Error handling
- Edge cases and boundary conditions

**Don't need to test**:
- Third-party libraries
- Simple getters/setters
- Pure UI components (covered by E2E)
- Obvious implementations

## Submitting Changes

### Pull Request Guidelines

**Before Submitting**:
1. ✅ All tests pass (`npm test` and `npm run test:e2e`)
2. ✅ Code follows style guidelines
3. ✅ New code has tests
4. ✅ Documentation updated (if needed)
5. ✅ Commit messages are clear
6. ✅ Branch is up to date with main

**PR Title Format**:
```
[Type] Brief description

Types: Feature, Bugfix, Refactor, Docs, Test, Chore
```

Examples:
- `[Feature] Add sound effects for animations`
- `[Bugfix] Fix parser error with nested loops`
- `[Docs] Update installation instructions`

**PR Description Template**:
```markdown
## What does this PR do?

Brief description of the changes.

## Why?

Explain the motivation for this change.

## How to test?

1. Step-by-step instructions to test
2. Expected behavior

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Checklist

- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

Closes #123
```

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge to main

### After Your PR is Merged

```bash
# Update your local main
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Adding New Features

### Feature Development Checklist

When adding a new feature:

1. **Plan**:
   - Create an issue describing the feature
   - Discuss approach with maintainers
   - Consider impact on existing code

2. **Design**:
   - Sketch UI changes (if applicable)
   - Plan data structures
   - Consider edge cases

3. **Implement**:
   - Follow code style guidelines
   - Keep changes focused and atomic
   - Write self-documenting code

4. **Test**:
   - Add unit tests for logic
   - Add E2E tests for user flows
   - Test manually in browser

5. **Document**:
   - Update README if needed
   - Update USER_GUIDE for user-facing features
   - Update the relevant `specs/<capability>.md` for any decision or
     invariant change — the spec must reflect current behaviour
   - Add inline comments for complex code

6. **Review**:
   - Self-review your changes
   - Check for console errors
   - Test in different browsers

### Common Feature Areas

**Adding a New Codino Keyword**:
1. Update grammar file: `src/core/language/codino.grammar`
2. Run `npm run build:grammar`
3. Update interpreter to handle new node type
4. Add tests for parsing and execution
5. Update USER_GUIDE.md with examples
6. Update `specs/codino-language.md` with the new decision/invariant

**Adding a New Feature Module**:
1. Either reuse an existing capability spec or create a new
   `specs/<capability>.md` first — the spec drives the design
2. Create folder in `src/features/`
3. Add components, hooks, types
4. Export from index file
5. Integrate with App.tsx
6. Add to state store if needed
7. Write tests
8. Update `specs/README.md` if a new capability area was added

**Modifying the API Integration**:
1. Update types in `src/core/api/types.ts`
2. Modify client in `src/core/api/claude.ts`
3. Update prompts in `src/core/api/prompts.ts`
4. Add validation in `src/core/api/validation.ts`
5. Test with actual API (use your key)
6. Add/update tests

## Project Architecture

### Key Concepts

**Feature-Based Structure**:
- Each feature (map, editor, execution) is self-contained
- Related components, hooks, and logic live together
- Easy to locate and modify code

**State Management**:
- Single Zustand store for global state
- Local state for UI-only concerns
- Automatic localStorage persistence

**Type Safety**:
- TypeScript strict mode enabled
- Explicit types for all APIs
- Interfaces over types for extensibility

**Testing Strategy**:
- Unit tests for logic
- E2E tests for user flows
- Manual testing for UX quality

See [specs/](../specs/) for detailed design documentation and architectural decisions.

## Common Tasks

### Modifying the Lezer Grammar

```bash
# 1. Edit the grammar file
vim src/core/language/codino.grammar

# 2. Rebuild the parser
npm run build:grammar

# 3. Test your changes
npm test

# 4. If tests pass, commit both files
git add src/core/language/codino.grammar
git add src/core/language/parser.ts
git commit -m "Update grammar: add new feature"
```

### Adding a New Translation

Currently supports Italian and English. To add a language:

1. Update language type: `'it' | 'en'` → `'it' | 'en' | 'es'`
2. Add keywords to grammar
3. Update UI text (could use i18n library)
4. Update API prompts to support language
5. Add language toggle option

### Debugging Tips

**Parser Issues**:
```typescript
// View AST structure
const tree = parse(code);
console.log(tree.topNode.toString());
```

**Interpreter Issues**:
```typescript
// Add debug logging
console.log('Executing node:', node.type.name);
console.log('Variables:', env.getAll());
```

**State Issues**:
```typescript
// View current state
import { useGameStore } from './store/gameStore';
console.log(useGameStore.getState());
```

**API Issues**:
- Check browser Network tab
- Look for CORS errors
- Verify API key is valid
- Check request/response in console

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/alessio/codino/discussions)
- **Bugs**: [GitHub Issues](https://github.com/alessio/codino/issues)
- **Chat**: (Add Discord/Slack link if available)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- Keep discussions on-topic

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Acknowledged in release notes
- Featured in project README

Thank you for contributing to Codino! 🚀
