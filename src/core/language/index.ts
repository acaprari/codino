import { parser } from './parser';

export function parse(code: string) {
  return parser.parse(code);
}

export { parser };
export { execute } from './interpreter';
export { RuntimeError } from './types';
export type { ExecutionResult, ExecutionStep } from './types';
