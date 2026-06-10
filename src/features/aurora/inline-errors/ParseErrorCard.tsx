import type { ParseError } from '../../../core/language';

interface ParseErrorCardProps {
  error: ParseError;
  language: 'it' | 'en';
}

function buildMessage(error: ParseError, language: 'it' | 'en'): string {
  const lineLabel = language === 'it' ? 'riga' : 'line';
  switch (error.type) {
    case 'typo-keyword':
      return language === 'it'
        ? `Hai scritto "${error.found}" alla ${lineLabel} ${error.line} — forse intendevi ${error.suggestion}? 🤔`
        : `You wrote "${error.found}" on ${lineLabel} ${error.line} — did you mean ${error.suggestion}? 🤔`;
    case 'missing-end':
      return language === 'it'
        ? `Il blocco alla ${lineLabel} ${error.line} ha bisogno di un FINE! 🤔`
        : `The block on ${lineLabel} ${error.line} needs a FINE (or END)! 🤔`;
    case 'syntax-error':
    default:
      return language === 'it'
        ? `C'è un problema alla ${lineLabel} ${error.line}.`
        : `There's a problem on ${lineLabel} ${error.line}.`;
  }
}

export function ParseErrorCard({ error, language }: ParseErrorCardProps) {
  return (
    <div
      style={{
        background: 'rgba(var(--aurora-accent-error-rgb), 0.10)',
        border: '1px solid rgba(var(--aurora-accent-error-rgb), 0.30)',
        borderLeft: '3px solid var(--aurora-accent-error)',
        borderRadius: 'var(--aurora-card-radius)',
        padding: '10px 14px',
        color: 'var(--aurora-text-primary)',
        fontSize: '13.5px',
        lineHeight: 1.5,
      }}
    >
      {buildMessage(error, language)}
    </div>
  );
}
