import { parser } from './parser';
import { getParseErrors } from './errors';

export function parse(code: string) {
  return parser.parse(code);
}

export function parseWithErrors(code: string) {
  const tree = parser.parse(code);
  const errors = getParseErrors(code, tree);
  return { tree, errors };
}

export { parser };
export { execute } from './interpreter';
export { RuntimeError } from './types';
export type { ExecutionResult, ExecutionStep } from './types';
export type { ParseError, ParseErrorType } from './errors';
