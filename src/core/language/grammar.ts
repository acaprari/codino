import { styleTags, tags } from '@lezer/highlight';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { parser } from './parser';

const codinoLRLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        // All keywords share the keyword tag
        'SCRIVI WRITE RIPETI REPEAT VOLTE TIMES FINE END SE IF ALTRIMENTI ELSE': tags.keyword,
        'Number': tags.number,
        'String': tags.string,
        // Identifiers used as variable names
        'Identifier': tags.variableName,
        // Arithmetic and comparison operators
        'Plus Minus Times XMul Divide Greater Less Equal': tags.operator,
      }),
    ],
  }),
});

export function codinoLanguageSupport(): LanguageSupport {
  return new LanguageSupport(codinoLRLanguage);
}
