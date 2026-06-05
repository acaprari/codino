import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/language';
import { execute } from '../../../src/core/language/interpreter';

describe('Interpreter', () => {
  it('executes simple assignment', () => {
    const code = 'a = 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[result.steps.length - 1].variables.a).toBe(5);
  });

  it('executes assignment with decimal number', () => {
    const code = 'pi = 3.14';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[result.steps.length - 1].variables.pi).toBe(3.14);
  });

  it('executes print statement', () => {
    const code = 'SCRIVI "hello"';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['hello']);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].output).toBe('hello');
  });

  it('executes print with variable', () => {
    const code = 'n = 10\nSCRIVI n';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['10']);
  });

  it('executes simple loop in Italian', () => {
    const code = 'RIPETI 3 VOLTE\nSCRIVI "ciao"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['ciao', 'ciao', 'ciao']);
  });

  it('executes simple loop in English', () => {
    const code = 'REPEAT 2 TIMES\nWRITE "hello"\nEND';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['hello', 'hello']);
  });

  it('executes conditional with > comparison', () => {
    const code = 'n = 10\nSE n > 5\nSCRIVI "maggiore"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['maggiore']);
  });

  it('executes conditional with < comparison', () => {
    const code = 'n = 3\nSE n < 5\nSCRIVI "minore"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['minore']);
  });

  it('executes conditional with = comparison', () => {
    const code = 'n = 5\nSE n = 5\nSCRIVI "uguale"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['uguale']);
  });

  it('executes conditional with ELSE branch', () => {
    const code = 'n = 3\nSE n = 5\nSCRIVI "cinque"\nALTRIMENTI\nSCRIVI "altro"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['altro']);
  });

  it('evaluates math expression with addition', () => {
    const code = 'risultato = 10 + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(15);
  });

  it('evaluates math expression with subtraction', () => {
    const code = 'risultato = 10 - 3';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(7);
  });

  it('evaluates math expression with multiplication using *', () => {
    const code = 'risultato = 5 * 3';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(15);
  });

  it('evaluates math expression with multiplication using lowercase x', () => {
    const code = 'risultato = 5 x 3';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(15);
  });

  it('evaluates math expression with division using /', () => {
    const code = 'risultato = 10 / 2';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(5);
  });

  it('evaluates math expression with division using :', () => {
    const code = 'risultato = 10 : 2';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(5);
  });

  it('handles division by zero error', () => {
    const code = 'risultato = 10 / 0';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Division by zero');
    expect(result.error?.line).toBe(1);
  });

  it('handles undefined variable error', () => {
    const code = 'a = b + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Undefined variable: b');
    expect(result.error?.line).toBe(1);
  });

  it('handles string used in arithmetic', () => {
    const code = 'parola = "ciao"\nrisultato = parola + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('text');
  });

  it('tracks execution steps with variable state', () => {
    const code = 'a = 5\nb = 10\nc = a + b';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBe(3);
    expect(result.steps[0].variables).toEqual({ a: 5 });
    expect(result.steps[1].variables).toEqual({ a: 5, b: 10 });
    expect(result.steps[2].variables).toEqual({ a: 5, b: 10, c: 15 });
  });

  it('evaluates complex expressions with operator precedence (* before +)', () => {
    const code = 'risultato = 10 + 5 * 2';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(20);
  });

  it('evaluates parenthesized expressions', () => {
    const code = 'risultato = (2 + 3) * 4';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(20);
  });

  it('executes loop with zero iterations without error', () => {
    const code = 'RIPETI 0 VOLTE\nSCRIVI "test"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual([]);
  });

  it('handles decimal loop count error', () => {
    const code = 'RIPETI 2.5 VOLTE\nSCRIVI "test"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Loop count must be an integer');
    expect(result.error?.line).toBe(1);
  });

  it('rejects loop count exceeding 1000', () => {
    const code = 'RIPETI 1001 VOLTE\nSCRIVI "test"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('1000');
  });

  it('accepts loop count of exactly 1000', () => {
    const code = 'RIPETI 1000 VOLTE\nSCRIVI "a"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toHaveLength(1000);
  });

  it('reports correct line number for multiline errors', () => {
    const code = 'a = 5\nb = 10\nc = w + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Undefined variable: w');
    expect(result.error?.line).toBe(3);
  });
});
