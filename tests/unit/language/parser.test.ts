import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/language';

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

  it('parses variable named x without conflict', () => {
    const tree = parse('x = 10');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses multiplication with uppercase X', () => {
    const tree = parse('risultato = 5 X 3');
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

  it('parses conditional with == comparison in Italian', () => {
    const tree = parse('SE x == 5\nSCRIVI "cinque"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with == comparison in English', () => {
    const tree = parse('IF x == 5\nWRITE "five"\nEND');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with > comparison', () => {
    const tree = parse('SE x > 5\nSCRIVI "maggiore"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with < comparison', () => {
    const tree = parse('SE x < 5\nSCRIVI "minore"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with ELSE clause in Italian', () => {
    const tree = parse('SE x == 5\nSCRIVI "cinque"\nALTRIMENTI\nSCRIVI "altro"\nFINE');
    expect(tree.length).toBeGreaterThan(0);
  });

  it('parses conditional with ELSE clause in English', () => {
    const tree = parse('IF x == 5\nWRITE "five"\nELSE\nWRITE "other"\nEND');
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
});
