import { useGameStore } from '../../store/gameStore';

interface NavbarProps {
  onSettingsClick?: () => void;
}

export function Navbar({ onSettingsClick }: NavbarProps) {
  const { language, setLanguage } = useGameStore();

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-child-lg font-bold text-purple-600">Codino</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="text-child-base px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            {language === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}
          </button>

          <button
            onClick={onSettingsClick}
            className="text-child-base px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            ⚙️
          </button>
        </div>
      </div>
    </nav>
  );
}
