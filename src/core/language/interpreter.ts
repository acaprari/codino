import type { Tree, SyntaxNode } from '@lezer/common';
import { ExecutionStep, ExecutionResult, RuntimeError } from './types';

const MAX_LOOP_ITERATIONS = 1000;

/**
 * Environment for variable storage and management
 */
class Environment {
  private variables: Map<string, number | string> = new Map();

  set(name: string, value: number | string): void {
    this.variables.set(name, value);
  }

  get(name: string, line: number = 1): number | string {
    if (!this.variables.has(name)) {
      throw new RuntimeError(`Undefined variable: ${name}`, line);
    }
    return this.variables.get(name)!;
  }

  has(name: string): boolean {
    return this.variables.has(name);
  }

  getAll(): Record<string, number | string> {
    const result: Record<string, number | string> = {};
    this.variables.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

/**
 * Get line number for a given position in the code
 */
function getLineNumber(code: string, pos: number): number {
  const lines = code.substring(0, pos).split('\n');
  return lines.length;
}

/**
 * Execute a Codino program from its AST
 */
export function execute(tree: Tree, code: string): ExecutionResult {
  const env = new Environment();
  const steps: ExecutionStep[] = [];
  const output: string[] = [];
  let currentLine = 1; // Track current line number for error reporting

  try {
    const cursor = tree.cursor();

    // Navigate to the first child (should be inside Program node)
    if (cursor.firstChild()) {
      // Execute the first statement
      currentLine = getLineNumber(code, cursor.node.from);
      executeNode(cursor.node, env, code, steps, output);

      // Execute all subsequent statements
      while (cursor.nextSibling()) {
        currentLine = getLineNumber(code, cursor.node.from);
        executeNode(cursor.node, env, code, steps, output);
      }
    }

    return { steps, output };
  } catch (error) {
    if (error instanceof RuntimeError) {
      return { steps, output, error };
    }
    // Convert generic errors to RuntimeError with current line number
    const runtimeError = new RuntimeError(
      error instanceof Error ? error.message : String(error),
      currentLine
    );
    return { steps, output, error: runtimeError };
  }
}

/**
 * Execute a single AST node
 */
function executeNode(
  node: SyntaxNode,
  env: Environment,
  code: string,
  steps: ExecutionStep[],
  output: string[]
): void {
  const nodeName = node.type.name;

  switch (nodeName) {
    case 'Assignment':
      executeAssignment(node, env, code, steps);
      break;
    case 'Print':
      executePrint(node, env, code, steps, output);
      break;
    case 'Loop':
      executeLoop(node, env, code, steps, output);
      break;
    case 'Conditional':
      executeConditional(node, env, code, steps, output);
      break;
  }
}

/**
 * Execute an assignment statement: identifier = expression
 * AST structure: Assignment(Identifier, Term, [Op, Term, ...])
 */
function executeAssignment(
  node: SyntaxNode,
  env: Environment,
  code: string,
  steps: ExecutionStep[]
): void {
  const line = getLineNumber(code, node.from);

  // First child is the identifier, rest are expression parts
  let identifier: string | null = null;
  const expressionParts: SyntaxNode[] = [];

  let child = node.firstChild;
  let isFirst = true;
  while (child) {
    if (isFirst && child.type.name === 'Identifier') {
      identifier = code.substring(child.from, child.to);
      isFirst = false;
    } else if (!isFirst && child.type.name !== '⚠' && child.type.name !== 'Equal') {
      // Everything after the identifier (skipping the = separator) is part of the expression
      expressionParts.push(child);
    }
    child = child.nextSibling;
  }

  if (!identifier || expressionParts.length === 0) {
    throw new RuntimeError('Invalid assignment', line);
  }

  const value = evaluateFlatExpression(expressionParts, env, code, line);
  env.set(identifier, value);

  steps.push({
    line,
    variables: env.getAll(),
  });
}

/**
 * Execute a print statement
 */
function executePrint(
  node: SyntaxNode,
  env: Environment,
  code: string,
  steps: ExecutionStep[],
  output: string[]
): void {
  const line = getLineNumber(code, node.from);

  // Collect all expression parts (everything that's not a keyword)
  const expressionParts: SyntaxNode[] = [];
  let child = node.firstChild;
  while (child) {
    if (
      child.type.name !== 'SCRIVI' &&
      child.type.name !== 'WRITE' &&
      child.type.name !== '⚠'
    ) {
      expressionParts.push(child);
    }
    child = child.nextSibling;
  }

  if (expressionParts.length === 0) {
    throw new RuntimeError('Print statement has no expression', line);
  }

  const value = evaluateFlatExpression(expressionParts, env, code, line);
  const outputStr = String(value);
  output.push(outputStr);

  steps.push({
    line,
    variables: env.getAll(),
    output: outputStr,
  });
}

/**
 * Execute a loop statement
 */
function executeLoop(
  node: SyntaxNode,
  env: Environment,
  code: string,
  steps: ExecutionStep[],
  output: string[]
): void {
  const line = getLineNumber(code, node.from);

  // Find the number of iterations
  let iterations = 0;
  const bodyStatements: SyntaxNode[] = [];

  let child = node.firstChild;
  let foundNumber = false;
  let inBody = false;

  while (child) {
    if (child.type.name === 'Number') {
      iterations = parseFloat(code.substring(child.from, child.to));
      foundNumber = true;
    } else if (
      foundNumber &&
      (child.type.name === 'VOLTE' ||
        child.type.name === 'TIMES')
    ) {
      inBody = true;
    } else if (
      inBody &&
      child.type.name !== 'FINE' &&
      child.type.name !== 'END' &&
      child.type.name !== '⚠'
    ) {
      bodyStatements.push(child);
    }
    child = child.nextSibling;
  }

  // Validate loop count
  if (iterations < 0) {
    throw new RuntimeError('Loop count cannot be negative', line);
  }
  if (!Number.isInteger(iterations)) {
    throw new RuntimeError('Loop count must be an integer', line);
  }
  if (iterations > MAX_LOOP_ITERATIONS) {
    throw new RuntimeError(`Loop count too large (maximum ${MAX_LOOP_ITERATIONS})`, line);
  }

  // Execute the loop body iterations times
  for (let i = 0; i < iterations; i++) {
    for (const statement of bodyStatements) {
      executeNode(statement, env, code, steps, output);
    }
  }
}

/**
 * Execute a conditional statement
 * Structure: Conditional(SE/IF, Term, Operator, Term, statements..., FINE/END)
 */
function executeConditional(
  node: SyntaxNode,
  env: Environment,
  code: string,
  steps: ExecutionStep[],
  output: string[]
): void {
  const line = getLineNumber(code, node.from);

  // Collect statements (everything that's not part of the condition or keywords)
  const thenStatements: SyntaxNode[] = [];
  const elseStatements: SyntaxNode[] = [];
  let inElse = false;
  let seenCondition = false;

  let child = node.firstChild;
  while (child) {
    const isKeyword =
      child.type.name === 'SE' ||
      child.type.name === 'IF' ||
      child.type.name === 'ALTRIMENTI' ||
      child.type.name === 'ELSE' ||
      child.type.name === 'FINE' ||
      child.type.name === 'END';

    const isOperator =
      child.type.name === 'Greater' ||
      child.type.name === 'Less' ||
      child.type.name === 'Equal';

    const isTerm = child.type.name === 'Term';

    // Skip keywords
    if (isKeyword) {
      if (child.type.name === 'ALTRIMENTI' || child.type.name === 'ELSE') {
        inElse = true;
      }
      child = child.nextSibling;
      continue;
    }

    // Skip condition parts (Terms and operators before the first statement)
    if (!seenCondition && (isTerm || isOperator)) {
      child = child.nextSibling;
      continue;
    }

    // Once we see a statement node, we're past the condition
    if (
      child.type.name === 'Assignment' ||
      child.type.name === 'Print' ||
      child.type.name === 'Loop' ||
      child.type.name === 'Conditional'
    ) {
      seenCondition = true;
      if (inElse) {
        elseStatements.push(child);
      } else {
        thenStatements.push(child);
      }
    }

    child = child.nextSibling;
  }

  // Evaluate the condition by passing the whole Conditional node
  // evaluateCondition will extract the condition parts
  const conditionResult = evaluateCondition(node, env, code, line);

  // Execute the appropriate branch
  if (conditionResult) {
    for (const statement of thenStatements) {
      executeNode(statement, env, code, steps, output);
    }
  } else {
    for (const statement of elseStatements) {
      executeNode(statement, env, code, steps, output);
    }
  }
}

/**
 * Evaluate a flat expression (list of Terms and operators)
 * Handles: Term, Op, Term, Op, Term, ...
 * Evaluates left-to-right respecting Lezer's grammar precedence
 */
function evaluateFlatExpression(
  parts: SyntaxNode[],
  env: Environment,
  code: string,
  line: number
): number | string {
  if (parts.length === 0) {
    throw new RuntimeError('Empty expression', line);
  }

  // If single part, evaluate it as a term
  if (parts.length === 1) {
    return evaluateTerm(parts[0], env, code, line);
  }

  // Collect values and operators
  const values: (number | string)[] = [];
  const operators: string[] = [];

  for (const part of parts) {
    if (
      part.type.name === 'Plus' ||
      part.type.name === 'Minus' ||
      part.type.name === 'Times' ||
      part.type.name === 'XMul' ||
      part.type.name === 'Divide'
    ) {
      const op =
        part.type.name === 'Plus'
          ? '+'
          : part.type.name === 'Minus'
          ? '-'
          : part.type.name === 'Times' || part.type.name === 'XMul'
          ? '*'
          : '/';
      operators.push(op);
    } else {
      values.push(evaluateTerm(part, env, code, line));
    }
  }

  if (values.length !== operators.length + 1) {
    throw new RuntimeError('Invalid expression structure', line);
  }

  // Strings cannot be used in arithmetic
  for (const v of values) {
    if (typeof v === 'string') {
      throw new RuntimeError('Cannot use text in an arithmetic operation', line);
    }
  }

  // Apply operators with precedence: * and / before + and -
  // First pass: multiply and divide
  let i = 0;
  while (i < operators.length) {
    if (operators[i] === '*' || operators[i] === '/') {
      const left = Number(values[i]);
      const right = Number(values[i + 1]);

      if (operators[i] === '/') {
        if (right === 0) {
          throw new RuntimeError('Division by zero', line);
        }
        values[i] = left / right;
      } else {
        values[i] = left * right;
      }

      values.splice(i + 1, 1);
      operators.splice(i, 1);
    } else {
      i++;
    }
  }

  // Second pass: add and subtract
  let result = Number(values[0]);
  for (let i = 0; i < operators.length; i++) {
    const right = Number(values[i + 1]);
    if (operators[i] === '+') {
      result += right;
    } else {
      result -= right;
    }
  }

  return result;
}

/**
 * Evaluate a single term (Number, String, Identifier, or Term node)
 */
function evaluateTerm(
  node: SyntaxNode,
  env: Environment,
  code: string,
  line: number
): number | string {
  const nodeName = node.type.name;

  if (nodeName === 'Number') {
    return parseFloat(code.substring(node.from, node.to));
  }

  if (nodeName === 'String') {
    const str = code.substring(node.from, node.to);
    // Remove quotes
    return str.substring(1, str.length - 1);
  }

  if (nodeName === 'Identifier') {
    const name = code.substring(node.from, node.to);
    if (!env.has(name)) {
      throw new RuntimeError(`Undefined variable: ${name}`, line);
    }
    return env.get(name, line);
  }

  // Handle Term node (wrapper around Number/String/Identifier or parenthesized expression)
  if (nodeName === 'Term') {
    const children: SyntaxNode[] = [];
    let child = node.firstChild;

    while (child) {
      if (child.type.name !== '⚠') {
        children.push(child);
      }
      child = child.nextSibling;
    }

    if (children.length === 0) {
      throw new RuntimeError('Empty term', line);
    }

    // If we have multiple children (Terms and operators), it's a parenthesized expression
    // Example: Term(Term(2), Plus, Term(3))
    if (children.length > 1) {
      return evaluateFlatExpression(children, env, code, line);
    }

    // Single child - just evaluate it
    return evaluateTerm(children[0], env, code, line);
  }

  throw new RuntimeError(`Cannot evaluate: ${nodeName}`, line);
}

/**
 * Evaluate a condition (comparison expression)
 * Conditionals have flat structure: SE/IF, Term, Operator, Term, statements...
 * We need to extract just the condition part (Term, Operator, Term)
 */
function evaluateCondition(
  node: SyntaxNode,
  env: Environment,
  code: string,
  line: number
): boolean {
  // Collect condition parts: skip keywords, stop at statements or ELSE/FINE
  const parts: SyntaxNode[] = [];
  let child = node.firstChild;

  while (child) {
    // Skip keywords and end markers
    if (child.type.name === 'SE' || child.type.name === 'IF') {
      child = child.nextSibling;
      continue;
    }

    // Stop when we hit a statement or ELSE/FINE
    if (
      child.type.name === 'Assignment' ||
      child.type.name === 'Print' ||
      child.type.name === 'Loop' ||
      child.type.name === 'Conditional' ||
      child.type.name === 'ALTRIMENTI' ||
      child.type.name === 'ELSE' ||
      child.type.name === 'FINE' ||
      child.type.name === 'END'
    ) {
      break;
    }

    // Collect condition parts (Terms and operators)
    if (child.type.name !== '⚠') {
      parts.push(child);
    }

    child = child.nextSibling;
  }

  // Find operator position
  let operatorIdx = -1;
  let operator: string | null = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.type.name === 'Greater') {
      operator = '>';
      operatorIdx = i;
      break;
    } else if (part.type.name === 'Less') {
      operator = '<';
      operatorIdx = i;
      break;
    } else if (part.type.name === 'Equal') {
      operator = '==';
      operatorIdx = i;
      break;
    }
  }

  if (operatorIdx === -1 || !operator) {
    throw new RuntimeError('Invalid condition', line);
  }

  // Parts before operator are left side, parts after are right side
  const leftParts = parts.slice(0, operatorIdx);
  const rightParts = parts.slice(operatorIdx + 1);

  if (leftParts.length === 0 || rightParts.length === 0) {
    throw new RuntimeError('Invalid condition', line);
  }

  const leftValue = evaluateFlatExpression(leftParts, env, code, line);
  const rightValue = evaluateFlatExpression(rightParts, env, code, line);

  // Convert to numbers for comparison
  const leftNum = typeof leftValue === 'number' ? leftValue : parseFloat(String(leftValue));
  const rightNum = typeof rightValue === 'number' ? rightValue : parseFloat(String(rightValue));

  switch (operator) {
    case '>':
      return leftNum > rightNum;
    case '<':
      return leftNum < rightNum;
    case '==':
      return leftNum === rightNum;
    default:
      throw new RuntimeError(`Unknown comparison operator: ${operator}`, line);
  }
}

