import { Label } from '../../../components/aurora/Label';

interface ProblemCardProps {
  narrative: string;
  expectedOutput: string;
  language: 'it' | 'en';
}

const T = {
  it: { title: '📖 Problema', expected: 'Output atteso' },
  en: { title: '📖 Problem',  expected: 'Expected output' },
};

export function ProblemCard({ narrative, expectedOutput, language }: ProblemCardProps) {
  const t = T[language];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Label>{t.title}</Label>
      <div
        style={{
          fontSize: '14.5px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'var(--aurora-text-primary)',
        }}
      >
        {narrative}
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '12px',
          color: 'var(--aurora-text-tertiary)',
        }}
      >
        {t.expected}: <code style={{ fontFamily: 'var(--aurora-font-code)', color: 'var(--aurora-text-secondary)' }}>{expectedOutput}</code>
      </div>
    </div>
  );
}
