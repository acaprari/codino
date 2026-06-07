import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface MapErrorModalProps {
  open: boolean;
  language: 'it' | 'en';
  onRetry: () => void;
  onOpenSettings: () => void;
}

const T = {
  it: {
    title: 'Ops! La mappa non è arrivata.',
    body: 'Qualcosa è andato storto. Controlla la chiave API e la connessione, poi riprova.',
    retry: 'Riprova',
    settings: 'Apri impostazioni',
  },
  en: {
    title: 'Oops! The map did not arrive.',
    body: 'Something went wrong. Check your API key and connection, then try again.',
    retry: 'Try Again',
    settings: 'Open Settings',
  },
};

export function MapErrorModal({ open, language, onRetry, onOpenSettings }: MapErrorModalProps) {
  const t = T[language];
  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={460}>
      <div style={{ textAlign: 'center', fontFamily: 'var(--aurora-font-ui)' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌧️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px', color: 'var(--aurora-text-primary)' }}>{t.title}</h2>
        <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>{t.body}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={onOpenSettings}>{t.settings}</AuroraButton>
          <AuroraButton variant="primary" onClick={onRetry}>{t.retry}</AuroraButton>
        </div>
      </div>
    </AuroraModal>
  );
}
