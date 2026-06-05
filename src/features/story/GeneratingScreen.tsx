interface GeneratingScreenProps {
  language: 'it' | 'en';
}

export function GeneratingScreen({ language }: GeneratingScreenProps) {
  const text = {
    it: {
      title: 'Sto creando la tua mappa…',
      subtitle: 'Preparo la tua avventura!',
    },
    en: {
      title: 'Creating your map…',
      subtitle: 'Preparing your adventure!',
    },
  };

  const t = text[language];

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🗺️</div>
        <h2 className="text-child-xl font-bold text-purple-600 mb-4">{t.title}</h2>
        <p className="text-child-base text-gray-600">{t.subtitle}</p>
      </div>
    </div>
  );
}
