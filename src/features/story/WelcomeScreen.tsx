import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/gameStore';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { language } = useGameStore();

  const text = {
    it: {
      title: 'Benvenuto in Codino!',
      subtitle: 'Impara a programmare attraverso la tua storia',
      button: 'Inizia la tua avventura',
    },
    en: {
      title: 'Welcome to Codino!',
      subtitle: 'Learn to code through storytelling',
      button: 'Start Your Adventure',
    },
  };

  const t = text[language];

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-lg text-center">
        <h1 className="text-child-xl font-bold text-purple-600 mb-4">
          {t.title}
        </h1>
        <p className="text-child-base text-gray-700 mb-8">
          {t.subtitle}
        </p>
        <Button variant="primary" size="lg" onClick={onStart}>
          {t.button}
        </Button>
      </Card>
    </div>
  );
}
