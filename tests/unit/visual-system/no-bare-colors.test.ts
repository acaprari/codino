import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';

const repoRoot = process.cwd();
const srcRoot = resolve(repoRoot, 'src');
const auroraCss = resolve(srcRoot, 'styles/aurora.css');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

// Strip block + line comments before scanning so commented-out hex / examples
// in docs don't trip the assertion.
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

// Bare hex literal: # followed by 3, 4, 6, or 8 hex digits, NOT preceded by a
// quote-style URL fragment (avoid matching e.g. hash fragments inside strings
// that aren't colors). Conservatively, we match all such literals — INV-VS-01
// forbids them outside aurora.css regardless of context.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

// Bare rgb()/rgba() with literal numeric components, e.g. rgba(255, 255, 255, 0.07).
// Allowed form is rgba(var(--aurora-*-rgb), <alpha>) — the var() reference makes
// the first character after '(' non-numeric, so this regex skips it.
const RGB_RE = /\brgba?\(\s*\d/g;

describe('INV-VS-01: no bare color literals outside aurora.css', () => {
  const files = walk(srcRoot).filter((f) => f !== auroraCss);

  for (const file of files) {
    const rel = relative(repoRoot, file);
    it(`${rel} contains no bare hex or rgb() literals`, () => {
      const stripped = stripComments(readFileSync(file, 'utf-8'));
      const hex = stripped.match(HEX_RE) ?? [];
      const rgb = stripped.match(RGB_RE) ?? [];
      expect(
        { hex, rgb },
        `${rel} has bare color literals; use var(--aurora-*) or rgba(var(--aurora-*-rgb), <alpha>) instead`,
      ).toEqual({ hex: [], rgb: [] });
    });
  }
});
