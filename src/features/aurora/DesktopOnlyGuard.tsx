import { useEffect, useState, type ReactNode } from 'react';
import { AuroraBackground } from './AuroraBackground';

interface DesktopOnlyGuardProps {
  language: 'it' | 'en';
  children: ReactNode;
}

const MIN_WIDTH = 900;

const T = {
  it: {
    title: 'Codino richiede uno schermo grande',
    body: 'Per programmare hai bisogno di una tastiera. Apri Codino su un computer o un laptop.',
  },
  en: {
    title: 'Codino needs a larger screen',
    body: 'You need a keyboard to write code. Open Codino on a desktop or laptop.',
  },
};

export function DesktopOnlyGuard({ language, children }: DesktopOnlyGuardProps) {
  const [w, setW] = useState(typeof window === 'undefined' ? 1024 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (w < MIN_WIDTH) {
    const t = T[language];
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <AuroraBackground />
        <div style={{
          background: 'var(--aurora-glass-elevated)',
          border: '1px solid var(--aurora-glass-border)',
          backdropFilter: 'var(--aurora-glass-blur)',
          WebkitBackdropFilter: 'var(--aurora-glass-blur)',
          borderRadius: 'var(--aurora-modal-radius)',
          padding: '32px',
          color: 'var(--aurora-text-primary)',
          textAlign: 'center',
          maxWidth: '420px',
          boxShadow: 'var(--aurora-shadow-glass)',
          fontFamily: 'var(--aurora-font-ui)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💻</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{t.title}</h2>
          <p style={{ color: 'var(--aurora-text-secondary)', lineHeight: 1.5 }}>{t.body}</p>
        </div>
      </div>
    );
  }
  return <><AuroraBackground />{children}</>;
}
