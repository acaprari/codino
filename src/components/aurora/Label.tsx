import type { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  muted?: boolean;
}

export function Label({ children, muted = false }: LabelProps) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.9px',
        color: muted ? 'var(--aurora-text-tertiary)' : 'var(--aurora-accent-pink)',
        fontFamily: 'var(--aurora-font-ui)',
      }}
    >
      {children}
    </span>
  );
}
