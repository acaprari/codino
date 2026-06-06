interface RuntimeErrorCardProps {
  message: string;
  line: number;
  language: 'it' | 'en';
}

export function RuntimeErrorCard({ message, line, language }: RuntimeErrorCardProps) {
  const lineLabel = language === 'it' ? 'riga' : 'line';
  return (
    <div
      style={{
        background: 'rgba(253, 164, 175, 0.10)',
        border: '1px solid rgba(253, 164, 175, 0.30)',
        borderLeft: '3px solid var(--aurora-accent-error)',
        borderRadius: 'var(--aurora-card-radius)',
        padding: '10px 14px',
        color: 'var(--aurora-text-primary)',
        fontSize: '13.5px',
        lineHeight: 1.5,
      }}
    >
      🤔 {lineLabel.charAt(0).toUpperCase() + lineLabel.slice(1)} {line}: {message}
    </div>
  );
}
