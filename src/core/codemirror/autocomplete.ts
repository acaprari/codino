import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';

// All Codino keywords, both languages. Prefix matching at 2+ characters means
// typing "SCR" only surfaces Italian keywords, typing "WR" only English ones —
// no explicit language filtering needed.
const KEYWORD_COMPLETIONS: { label: string; type: 'keyword' }[] = [
  // Italian
  { label: 'SCRIVI',     type: 'keyword' },
  { label: 'RIPETI',     type: 'keyword' },
  { label: 'VOLTE',      type: 'keyword' },
  { label: 'SE',         type: 'keyword' },
  { label: 'ALTRIMENTI', type: 'keyword' },
  { label: 'FINE',       type: 'keyword' },
  // English
  { label: 'WRITE',      type: 'keyword' },
  { label: 'REPEAT',     type: 'keyword' },
  { label: 'TIMES',      type: 'keyword' },
  { label: 'IF',         type: 'keyword' },
  { label: 'ELSE',       type: 'keyword' },
  { label: 'END',        type: 'keyword' },
];

function codinoCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[A-Z]+/);
  if (!word) return null;
  // Auto-trigger only after 2 uppercase characters; explicit (Ctrl+Space) fires sooner
  if (!context.explicit && word.text.length < 2) return null;

  const matches = KEYWORD_COMPLETIONS.filter(kw => kw.label.startsWith(word.text));
  if (matches.length === 0) return null;

  return {
    from: word.from,
    options: matches,
    validFor: /^[A-Z]*$/,
  };
}

export const codinoAutocomplete = autocompletion({
  override: [codinoCompletionSource],
  defaultKeymap: true,
});
