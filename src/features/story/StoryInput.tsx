import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/gameStore';

interface StoryInputProps {
  onSubmit: (story: string) => void;
}

export function StoryInput({ onSubmit }: StoryInputProps) {
  const [story, setStory] = useState('');
  const { language } = useGameStore();

  const text = {
    it: {
      title: 'Racconta la tua storia!',
      placeholder: 'C\'era una volta...',
      examples: [
        'Un coraggioso cavaliere alla ricerca del tesoro...',
        'Un esploratore spaziale visita pianeti lontani...',
        'Un mago impara nuovi incantesimi...',
      ],
      examplesLabel: 'Esempi:',
      button: 'Inizia l\'avventura',
    },
    en: {
      title: 'Tell Your Story!',
      placeholder: 'Once upon a time...',
      examples: [
        'A brave knight searches for treasure...',
        'A space explorer visits distant planets...',
        'A wizard learns new spells...',
      ],
      examplesLabel: 'Examples:',
      button: 'Start Adventure',
    },
  };

  const t = text[language];

  const handleSubmit = () => {
    if (story.trim()) {
      onSubmit(story.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-2xl w-full">
        <h1 className="text-child-xl font-bold text-purple-600 mb-6 text-center">
          {t.title}
        </h1>

        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-40 p-4 text-child-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
          maxLength={500}
        />

        <div className="mt-4 text-child-sm text-gray-500 text-right">
          {story.length}/500
        </div>

        <div className="mt-6">
          <p className="text-child-sm text-gray-600 mb-2">{t.examplesLabel}</p>
          <div className="flex flex-wrap gap-2">
            {t.examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setStory(example)}
                className="px-3 py-2 text-child-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition"
              >
                {example.split('...')[0]}...
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!story.trim()}
          >
            {t.button}
          </Button>
        </div>
      </Card>
    </div>
  );
}
