import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface GameCompleteModalProps {
  open: boolean;
  totalStars: number;
  language: 'it' | 'en';
  onRestart: () => void;
  onClose: () => void;
}

const T = {
  it: {
    title: "Hai finito l'avventura!",
    body: 'Sei arrivato fino in fondo. Sei un vero codinatore!',
    restart: 'Nuova avventura',
    close: 'Chiudi',
    stars: 'stelle in totale',
  },
  en: {
    title: 'You finished the adventure!',
    body: 'You reached the end. You are a real Codinator!',
    restart: 'New adventure',
    close: 'Close',
    stars: 'stars total',
  },
};

export function GameCompleteModal({ open, totalStars, language, onRestart, onClose }: GameCompleteModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={onClose} dismissible maxWidth={520}>
      <div style={{ textAlign: 'center', fontFamily: 'var(--aurora-font-ui)' }}>
        <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: 'var(--aurora-text-primary)' }}>{t.title}</h2>
        <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>{t.body}</p>
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--aurora-accent-amber)', textShadow: '0 0 18px rgba(253, 224, 71, 0.5)', marginBottom: '26px' }}>
          ⭐ {totalStars} {t.stars}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={onClose}>{t.close}</AuroraButton>
          <AuroraButton variant="primary" onClick={onRestart}>{t.restart}</AuroraButton>
        </div>
      </div>
    </AuroraModal>
  );
}
