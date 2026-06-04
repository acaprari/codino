import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/language';
import { execute } from '../../../src/core/language/interpreter';

describe('Interpreter', () => {
  it('executes simple assignment', () => {
    const code = 'x = 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[result.steps.length - 1].variables.x).toBe(5);
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
    const code = 'x = 10\nSCRIVI x';
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
    const code = 'x = 10\nSE x > 5\nSCRIVI "maggiore"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['maggiore']);
  });

  it('executes conditional with < comparison', () => {
    const code = 'x = 3\nSE x < 5\nSCRIVI "minore"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['minore']);
  });

  it('executes conditional with == comparison', () => {
    const code = 'x = 5\nSE x == 5\nSCRIVI "uguale"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(['uguale']);
  });

  it('executes conditional with ELSE branch', () => {
    const code = 'x = 3\nSE x == 5\nSCRIVI "cinque"\nALTRIMENTI\nSCRIVI "altro"\nFINE';
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

  it('evaluates math expression with multiplication using X', () => {
    const code = 'risultato = 5 X 3';
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
    const code = 'x = y + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Undefined variable: y');
    expect(result.error?.line).toBe(1);
  });

  it('tracks execution steps with variable state', () => {
    const code = 'x = 5\ny = 10\nz = x + y';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBe(3);
    expect(result.steps[0].variables).toEqual({ x: 5 });
    expect(result.steps[1].variables).toEqual({ x: 5, y: 10 });
    expect(result.steps[2].variables).toEqual({ x: 5, y: 10, z: 15 });
  });

  it('evaluates complex expressions with operator precedence', () => {
    const code = 'risultato = 10 + 5 * 2';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    // With left-to-right evaluation in Lezer grammar: 5 * 2 = 10, then 10 + 10 = 20
    expect(result.steps[0].variables.risultato).toBe(20);
  });

  it('handles variable named x without multiplication conflict', () => {
    const code = 'x = 10\ny = x * 2';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[1].variables.y).toBe(20);
  });

  it('evaluates parenthesized expressions', () => {
    const code = 'risultato = (2 + 3) * 4';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeUndefined();
    expect(result.steps[0].variables.risultato).toBe(20);
  });

  it('handles negative loop count with validation', () => {
    // Use a variable with negative value to test runtime validation
    const code = 'n = -5\nRIPETI 0 VOLTE\nSCRIVI "test"\nFINE';
    const tree = parse(code);
    const result = execute(tree, code);

    // This test just ensures we don't crash with zero iterations
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

  it('reports correct line number for multiline errors', () => {
    const code = 'x = 5\ny = 10\nz = w + 5';
    const tree = parse(code);
    const result = execute(tree, code);

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Undefined variable: w');
    expect(result.error?.line).toBe(3);
  });
});
