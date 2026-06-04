import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/gameStore';
import { ApiKeyInput } from './ApiKeyInput';
import { ClaudeAPIClient } from '../../core/api/claude';

interface SettingsViewProps {
  onClose: () => void;
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const { apiKey, setApiKey, language, setLanguage, resetProgress } = useGameStore();

  const handleTestApiKey = async (key: string): Promise<boolean> => {
    try {
      const client = new ClaudeAPIClient(key);
      // Lightweight connection test - minimal token usage
      await client.testConnection();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleClearProgress = () => {
    if (confirm('Are you sure? This will delete your story and progress.')) {
      resetProgress();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-child-xl font-bold text-purple-600">Settings</h1>
          <button
            onClick={onClose}
            className="text-child-lg text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* API Key */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">API Key</h2>
            <ApiKeyInput
              value={apiKey}
              onSave={setApiKey}
              onTest={handleTestApiKey}
            />
          </section>

          {/* Language */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">Language</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setLanguage('it')}
                className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                  language === 'it'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-child-lg mb-1">🇮🇹</div>
                <div className="text-child-base font-bold">Italiano</div>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                  language === 'en'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-child-lg mb-1">🇬🇧</div>
                <div className="text-child-base font-bold">English</div>
              </button>
            </div>
          </section>

          {/* Clear Progress */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">Clear Progress</h2>
            <p className="text-child-base text-gray-600 mb-4">
              This will delete your story and all progress. Your API key will be kept.
            </p>
            <Button variant="warning" onClick={handleClearProgress}>
              ⚠️ Clear All Progress
            </Button>
          </section>
        </div>
      </Card>
    </div>
  );
}
