import { Label } from '../../../components/aurora/Label';

interface ExecutionPanelProps {
  output: string;
  variables: Record<string, number | string>;
  language: 'it' | 'en';
}

const T = {
  it: { output: 'Output', variables: 'Variabili', empty: '(vuoto)' },
  en: { output: 'Output', variables: 'Variables', empty: '(empty)' },
};

export function ExecutionPanel({ output, variables, language }: ExecutionPanelProps) {
  const t = T[language];
  const entries = Object.entries(variables);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label>{t.output}</Label>
        <div
          style={{
            background: 'rgba(110, 231, 183, 0.10)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            borderRadius: 'var(--aurora-card-radius)',
            padding: '10px 12px',
            fontFamily: 'var(--aurora-font-code)',
            fontSize: '13px',
            color: 'var(--aurora-text-primary)',
            whiteSpace: 'pre-wrap',
            minHeight: '40px',
          }}
        >
          {output || <span style={{ color: 'var(--aurora-text-tertiary)' }}>{t.empty}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label>{t.variables}</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entries.length === 0 && (
            <span style={{ color: 'var(--aurora-text-tertiary)', fontSize: '12px' }}>{t.empty}</span>
          )}
          {entries.map(([name, value]) => (
            <div
              key={name}
              style={{
                background: 'rgba(240, 171, 252, 0.10)',
                border: '1px solid rgba(240, 171, 252, 0.25)',
                borderRadius: 'var(--aurora-card-radius)',
                padding: '6px 10px',
                fontFamily: 'var(--aurora-font-code)',
                fontSize: '12.5px',
                color: 'var(--aurora-text-primary)',
              }}
            >
              <strong>{name}</strong> = {String(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
