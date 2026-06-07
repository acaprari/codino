import { describe, it, expect } from 'vitest';
import { parse, parseWithErrors } from '../../../src/core/language';

describe('Parser', () => {
  it('parses variable assignment', () => {
    const tree = parse('mele = 5');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses print statement in Italian', () => {
    const tree = parse('SCRIVI "hello"');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses print statement in English', () => {
    const tree = parse('WRITE "hello"');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('treats lowercase x as multiplication operator (reserved word)', () => {
    // x is reserved — using it as a variable produces a parse error
    const { errors } = parseWithErrors('x = 10');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('parses multiplication with lowercase x', () => {
    const tree = parse('risultato = 5 x 3');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses multiplication with asterisk', () => {
    const tree = parse('risultato = 5 * 3');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses decimal numbers', () => {
    const tree = parse('pi = 3.14');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses math expressions with addition', () => {
    const tree = parse('somma = 10 + 5');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses math expressions with subtraction', () => {
    const tree = parse('differenza = 10 - 5');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses math expressions with division using /', () => {
    const tree = parse('quoziente = 10 / 2');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses math expressions with division using :', () => {
    const tree = parse('quoziente = 10 : 2');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses loop in Italian', () => {
    const tree = parse('RIPETI 5 VOLTE\nSCRIVI "ciao"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses loop in English', () => {
    const tree = parse('REPEAT 5 TIMES\nWRITE "hello"\nEND');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with = comparison in Italian', () => {
    const tree = parse('SE mele = 5\nSCRIVI "cinque"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with = comparison in English', () => {
    const tree = parse('IF mele = 5\nWRITE "five"\nEND');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with > comparison', () => {
    const tree = parse('SE mele > 5\nSCRIVI "maggiore"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with < comparison', () => {
    const tree = parse('SE mele < 5\nSCRIVI "minore"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with ELSE clause in Italian', () => {
    const tree = parse('SE mele = 5\nSCRIVI "cinque"\nALTRIMENTI\nSCRIVI "altro"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with ELSE clause in English', () => {
    const tree = parse('IF mele = 5\nWRITE "five"\nELSE\nWRITE "other"\nEND');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses complex expression with multiple operations', () => {
    const tree = parse('risultato = 10 + 5 * 2 - 3');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses expression with parentheses', () => {
    const tree = parse('risultato = (10 + 5) * 2');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('allows variable names starting with x followed by other characters', () => {
    const { errors } = parseWithErrors('xa = 10\nx2 = 20');
    expect(errors).toHaveLength(0);
  });

  it('parses multi-arg WRITE with comma separator (English)', () => {
    const { errors } = parseWithErrors('WRITE "Animals:", apples');
    expect(errors).toHaveLength(0);
  });

  it('parses multi-arg SCRIVI with three arguments (Italian)', () => {
    const { errors } = parseWithErrors('SCRIVI "Hai", monete, "monete"');
    expect(errors).toHaveLength(0);
  });

  it('parses single-arg WRITE unchanged', () => {
    const { errors } = parseWithErrors('WRITE 42');
    expect(errors).toHaveLength(0);
  });

  it('trailing comma in WRITE is a parse error', () => {
    const { errors } = parseWithErrors('WRITE "x",');
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('parseWithErrors', () => {
  it('returns no errors for valid program', () => {
    const { errors } = parseWithErrors('mele = 5\nSCRIVI mele');
    expect(errors).toHaveLength(0);
  });

  it('detects keyword typo', () => {
    const { errors } = parseWithErrors('RIPETTI 3 VOLTE\nSCRIVI "ciao"\nFINE');
    expect(errors.length).toBeGreaterThan(0);
    const typo = errors.find(e => e.type === 'typo-keyword');
    expect(typo).toBeDefined();
    expect(typo?.suggestion).toBe('RIPETI');
  });

  it('detects missing FINE/END', () => {
    const { errors } = parseWithErrors('RIPETI 3 VOLTE\nSCRIVI "ciao"');
    expect(errors.length).toBeGreaterThan(0);
    const missing = errors.find(e => e.type === 'missing-end');
    expect(missing).toBeDefined();
  });
});
