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
});
