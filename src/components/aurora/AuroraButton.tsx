import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

interface AuroraButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

const baseStyle = {
  fontFamily: 'var(--aurora-font-ui)',
  fontSize: '14px',
  fontWeight: 600,
  padding: '11px 22px',
  borderRadius: 'var(--aurora-button-radius)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  border: 'none',
  transition: 'transform 0.15s, opacity 0.15s',
} as const;

const primaryStyle = {
  background: 'linear-gradient(135deg, var(--aurora-accent-purple), var(--aurora-accent-pink))',
  color: 'white',
  boxShadow: '0 6px 22px rgba(192,132,252,0.5)',
};

const ghostStyle = {
  background: 'rgba(255,255,255,0.10)',
  color: 'var(--aurora-text-primary)',
  border: '1px solid var(--aurora-glass-border)',
};

const disabledStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export function AuroraButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
}: AuroraButtonProps) {
  const style = {
    ...baseStyle,
    ...(variant === 'primary' ? primaryStyle : ghostStyle),
    ...(disabled ? disabledStyle : {}),
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-variant={variant}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  );
}
