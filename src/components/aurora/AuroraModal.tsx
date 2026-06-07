import { useEffect, type ReactNode } from 'react';

interface AuroraModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
  maxWidth?: number;
}

export function AuroraModal({
  open,
  onClose,
  children,
  dismissible = false,
  maxWidth = 560,
}: AuroraModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={dismissible ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--aurora-glass-elevated)',
          border: '1px solid var(--aurora-glass-border)',
          backdropFilter: 'var(--aurora-glass-blur)',
          WebkitBackdropFilter: 'var(--aurora-glass-blur)',
          borderRadius: 'var(--aurora-modal-radius)',
          padding: '28px',
          maxWidth: `${maxWidth}px`,
          width: '100%',
          color: 'var(--aurora-text-primary)',
          boxShadow: 'var(--aurora-shadow-glass)',
          fontFamily: 'var(--aurora-font-ui)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
