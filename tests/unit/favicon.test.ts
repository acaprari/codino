import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = process.cwd();
const svg = readFileSync(resolve(repoRoot, 'public/favicon.svg'), 'utf-8');
const html = readFileSync(resolve(repoRoot, 'index.html'), 'utf-8');
const auroraCss = readFileSync(resolve(repoRoot, 'src/styles/aurora.css'), 'utf-8');

function tokenValue(name: string): string {
  const m = auroraCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`token --${name} not found in aurora.css`);
  return m[1].trim();
}

describe('INV-VS-10: favicon derives from Aurora tokens', () => {
  it('uses the three Aurora background gradient stops', () => {
    expect(svg).toContain(tokenValue('aurora-bg-deep'));
    expect(svg).toContain(tokenValue('aurora-bg-mid'));
    expect(svg).toContain(tokenValue('aurora-bg-accent'));
  });

  it('embeds the brand "C" as a <path> element, not as <text>', () => {
    expect(svg).toMatch(/<path\b/);
    expect(svg).not.toMatch(/<text\b/);
  });

  it('theme-color meta in index.html matches --aurora-bg-mid', () => {
    const themeColorMatch = html.match(/<meta\s+name="theme-color"\s+content="([^"]+)"/);
    expect(themeColorMatch).not.toBeNull();
    expect(themeColorMatch![1]).toBe(tokenValue('aurora-bg-mid'));
  });
});
