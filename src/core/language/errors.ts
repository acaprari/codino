import type { Tree } from '@lezer/common';

export type ParseErrorType =
  | 'typo-keyword'   // input resembles a known keyword but is misspelled
  | 'missing-end'    // Loop or Conditional node has no FINE/END child
  | 'syntax-error';  // generic unexpected token

export interface ParseError {
  type: ParseErrorType;
  line: number;
  found?: string;       // text that caused the error
  suggestion?: string;  // closest known keyword, if applicable
}

const ALL_KEYWORDS = [
  'SCRIVI', 'WRITE',
  'RIPETI', 'REPEAT',
  'VOLTE', 'TIMES',
  'SE', 'IF',
  'ALTRIMENTI', 'ELSE',
  'FINE', 'END',
];

// Regex: tokens that look like attempted keywords — 2+ uppercase letters (possibly with digits)
const LOOKS_LIKE_KEYWORD = /^[A-Z]{2,}/;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function closestKeyword(text: string): string | null {
  const upper = text.toUpperCase();
  let best: string | null = null;
  let bestDist = Infinity;
  for (const kw of ALL_KEYWORDS) {
    if (Math.abs(upper.length - kw.length) > 3) continue;
    const dist = levenshtein(upper, kw);
    if (dist <= 2 && dist < bestDist) {
      bestDist = dist;
      best = kw;
    }
  }
  return best;
}

function getLineNumber(code: string, pos: number): number {
  return code.substring(0, pos).split('\n').length;
}

function hasEndKeyword(node: import('@lezer/common').SyntaxNode): boolean {
  let child = node.firstChild;
  while (child) {
    const n = child.type.name;
    if (n === 'FINE' || n === 'END') return true;
    child = child.nextSibling;
  }
  return false;
}

export function getParseErrors(code: string, tree: Tree): ParseError[] {
  const errors: ParseError[] = [];

  // Pass 1: scan source lines for keyword typos.
  // This is more reliable than inspecting ⚠ nodes because Lezer's error
  // recovery can place ⚠ at positions far from the actual mistake.
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    // Tokenize by whitespace; skip string literals crudely (between quotes)
    const rawLine = lines[i].replace(/"[^"]*"|'[^']*'/g, '');
    const tokens = rawLine.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      if (!LOOKS_LIKE_KEYWORD.test(token)) continue;
      const upper = token.toUpperCase();
      if (ALL_KEYWORDS.includes(upper)) continue;
      const suggestion = closestKeyword(upper);
      if (suggestion) {
        errors.push({ type: 'typo-keyword', line: lineNum, found: token, suggestion });
      }
    }
  }

  // Pass 2: walk AST for unclosed Loop/Conditional blocks.
  const cursor = tree.cursor();
  do {
    const name = cursor.type.name;
    if ((name === 'Loop' || name === 'Conditional') && !hasEndKeyword(cursor.node)) {
      const line = getLineNumber(code, cursor.from);
      errors.push({ type: 'missing-end', line });
    }
  } while (cursor.next());

  // Pass 3: ⚠ nodes not already explained by pass 1 → generic syntax error.
  if (errors.every(e => e.type !== 'typo-keyword')) {
    const seenPositions = new Set<number>();
    const cursor2 = tree.cursor();
    do {
      if (cursor2.type.name === '⚠' && !seenPositions.has(cursor2.from)) {
        seenPositions.add(cursor2.from);
        const line = getLineNumber(code, cursor2.from);
        const text = code.substring(cursor2.from, cursor2.to).trim();
        errors.push({ type: 'syntax-error', line, found: text || undefined });
      }
    } while (cursor2.next());
  }

  return errors;
}
