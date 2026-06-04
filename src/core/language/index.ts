import { parser } from './parser';

export function parse(code: string) {
  return parser.parse(code);
}

export { parser };
