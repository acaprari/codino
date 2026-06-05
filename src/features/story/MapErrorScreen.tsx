import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface MapErrorScreenProps {
  language: 'it' | 'en';
  onRetry: () => void;
  onSettings: () => void;
}

export function MapErrorScreen({ language, onRetry, onSettings }: MapErrorScreenProps) {
  const text = {
    it: {
      title: 'Ops! La mappa non è arrivata.',
      body: "Qualcosa è andato storto mentre creavo la tua mappa. Controlla la tua chiave API e la connessione, poi riprova.",
      retry: 'Riprova',
      settings: 'Apri impostazioni',
    },
    en: {
      title: 'Oops! The map did not arrive.',
      body: 'Something went wrong while creating your map. Check your API key and connection, then try again.',
      retry: 'Try Again',
      settings: 'Open Settings',
    },
  };

  const t = text[language];

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-lg text-center">
        <div className="text-6xl mb-4">🌧️</div>
        <h2 className="text-child-xl font-bold text-purple-600 mb-4">{t.title}</h2>
        <p className="text-child-base text-gray-700 mb-6">{t.body}</p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onSettings}>
            {t.settings}
          </Button>
          <Button variant="primary" onClick={onRetry}>
            {t.retry}
          </Button>
        </div>
      </Card>
    </div>
  );
}
