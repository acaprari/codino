import { AuroraModal } from '../../../components/aurora/AuroraModal';
import type { Element } from '../../../types/game';

interface BranchSuccessPopupProps {
  open: boolean;
  stars: number;
  explanation: string;
  narrativeBridge: string;
  branches: Element[];
  language: 'it' | 'en';
  onPick: (element: Element) => void;
}

const T = {
  it: { choose: 'Cosa scegli ora?' },
  en: { choose: 'What do you choose now?' },
};

export function BranchSuccessPopup({
  open, stars, explanation, narrativeBridge, branches, language, onPick,
}: BranchSuccessPopupProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={640}>
      <div style={{ textAlign: 'center', fontFamily: 'var(--aurora-font-ui)' }}>
        <div style={{ fontSize: '40px', marginBottom: '6px' }}>🎉</div>
        <div style={{ fontSize: '24px', letterSpacing: '4px', color: 'var(--aurora-accent-amber)', textShadow: '0 0 14px rgba(253, 224, 71, 0.6)', marginBottom: '10px' }}>
          {Array.from({ length: 3 }).map((_, i) => (i < stars ? '⭐' : '☆')).join('')}
        </div>
        <p style={{ color: 'var(--aurora-text-primary)', fontSize: '14.5px', marginBottom: '14px', lineHeight: 1.5 }}>{explanation}</p>
        <div style={{ background: 'rgba(167, 139, 250, 0.10)', borderLeft: '3px solid var(--aurora-accent-purple)', padding: '12px 16px', borderRadius: 'var(--aurora-card-radius)', textAlign: 'left', marginBottom: '20px', color: 'var(--aurora-text-primary)', lineHeight: 1.5 }}>
          {narrativeBridge}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-pink)', marginBottom: '10px' }}>{t.choose}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {branches.map((b, i) => (
            <button
              key={i}
              onClick={() => onPick(b)}
              style={{
                background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.30), rgba(240, 171, 252, 0.30))',
                border: '1px solid rgba(167, 139, 250, 0.50)',
                borderRadius: '12px',
                padding: '14px 18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--aurora-text-primary)',
                minWidth: '110px',
              }}
            >
              <div style={{ fontSize: '32px' }}>{b.emoji}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--aurora-font-ui)' }}>{b.name}</div>
            </button>
          ))}
        </div>
      </div>
    </AuroraModal>
  );
}
