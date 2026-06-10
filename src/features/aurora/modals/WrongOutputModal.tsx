import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface WrongOutputModalProps {
  open: boolean;
  explanation: string;
  expected: string;
  actual: string;
  language: 'it' | 'en';
  onTryAgain: () => void;
  onGetHint: () => void;
}

const T = {
  it: {
    title: '🤔 Non del tutto giusto!',
    expected: 'Atteso',
    actual: 'Ottenuto',
    tryAgain: 'Riprova',
    hint: 'Dammi un aiuto',
  },
  en: {
    title: '🤔 Not quite right!',
    expected: 'Expected',
    actual: 'You got',
    tryAgain: 'Try Again',
    hint: 'Give me a hint',
  },
};

export function WrongOutputModal({
  open, explanation, expected, actual, language, onTryAgain, onGetHint,
}: WrongOutputModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={onTryAgain} dismissible maxWidth={500}>
      <div style={{ fontFamily: 'var(--aurora-font-ui)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', textAlign: 'center', color: 'var(--aurora-text-primary)' }}>{t.title}</h2>
        <p style={{ color: 'var(--aurora-text-primary)', lineHeight: 1.5, marginBottom: '18px' }}>{explanation}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(var(--aurora-accent-success-rgb), 0.10)', borderLeft: '3px solid var(--aurora-accent-success)', padding: '10px 12px', borderRadius: 'var(--aurora-card-radius)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-success)', marginBottom: '4px' }}>{t.expected}</div>
            <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '13px', color: 'var(--aurora-text-primary)' }}>{expected}</div>
          </div>
          <div style={{ background: 'rgba(var(--aurora-accent-error-rgb), 0.10)', borderLeft: '3px solid var(--aurora-accent-error)', padding: '10px 12px', borderRadius: 'var(--aurora-card-radius)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-error)', marginBottom: '4px' }}>{t.actual}</div>
            <div style={{ fontFamily: 'var(--aurora-font-code)', fontSize: '13px', color: 'var(--aurora-text-primary)' }}>{actual}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={onGetHint}>{t.hint}</AuroraButton>
          <AuroraButton variant="primary" onClick={onTryAgain}>{t.tryAgain}</AuroraButton>
        </div>
      </div>
    </AuroraModal>
  );
}
