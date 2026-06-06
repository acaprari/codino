import type { ReactNode, CSSProperties } from 'react';

interface GlassPaneProps {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GlassPane({ children, elevated = false, className = '', style }: GlassPaneProps) {
  const intensity = elevated ? 'aurora-glass-elevated' : 'aurora-glass-surface';
  return (
    <div
      className={`${intensity} ${className}`.trim()}
      style={{
        background: `var(--aurora-glass-${elevated ? 'elevated' : 'surface'})`,
        border: '1px solid var(--aurora-glass-border)',
        backdropFilter: 'var(--aurora-glass-blur)',
        WebkitBackdropFilter: 'var(--aurora-glass-blur)',
        borderRadius: 'var(--aurora-pane-radius)',
        padding: 'var(--aurora-pane-padding)',
        boxShadow: 'var(--aurora-shadow-glass)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
