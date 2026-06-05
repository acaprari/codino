import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useGameStore } from '../../store/gameStore';
import { ApiKeyInput } from './ApiKeyInput';
import { ClaudeAPIClient } from '../../core/api/claude';

interface SettingsViewProps {
  onClose: () => void;
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const { apiKey, setApiKey, language, setLanguage, resetProgress } = useGameStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const text = {
    it: {
      title: 'Impostazioni',
      apiKeySection: 'Chiave API',
      languageSection: 'Lingua',
      italian: 'Italiano',
      english: 'Inglese',
      clearSection: 'Cancella progressi',
      clearDescription: 'Verranno cancellati la tua storia e tutti i progressi. La tua chiave API sarà mantenuta.',
      clearButton: '⚠️ Cancella tutti i progressi',
      confirmTitle: 'Sei sicuro?',
      confirmDescription: 'Questo cancellerà la tua storia e i progressi. Non si può tornare indietro.',
      cancel: 'Annulla',
      confirm: 'Conferma',
    },
    en: {
      title: 'Settings',
      apiKeySection: 'API Key',
      languageSection: 'Language',
      italian: 'Italian',
      english: 'English',
      clearSection: 'Clear Progress',
      clearDescription: 'This will delete your story and all progress. Your API key will be kept.',
      clearButton: '⚠️ Clear All Progress',
      confirmTitle: 'Are you sure?',
      confirmDescription: 'This will delete your story and progress. There is no way to undo this.',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
  };

  const t = text[language];

  const handleTestApiKey = async (key: string): Promise<boolean> => {
    try {
      const client = new ClaudeAPIClient(key);
      await client.testConnection();
      return true;
    } catch {
      return false;
    }
  };

  const handleConfirmClear = () => {
    resetProgress();
    setConfirmOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-child-xl font-bold text-purple-600">{t.title}</h1>
          <button
            onClick={onClose}
            className="text-child-lg text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* API Key */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">
              {t.apiKeySection}
            </h2>
            <ApiKeyInput
              value={apiKey}
              onSave={setApiKey}
              onTest={handleTestApiKey}
            />
          </section>

          {/* Language */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">
              {t.languageSection}
            </h2>
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
                <div className="text-child-base font-bold">{t.italian}</div>
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
                <div className="text-child-base font-bold">{t.english}</div>
              </button>
            </div>
          </section>

          {/* Clear Progress */}
          <section>
            <h2 className="text-child-lg font-bold text-gray-800 mb-4">
              {t.clearSection}
            </h2>
            <p className="text-child-base text-gray-600 mb-4">
              {t.clearDescription}
            </p>
            <Button variant="warning" onClick={() => setConfirmOpen(true)}>
              {t.clearButton}
            </Button>
          </section>
        </div>
      </Card>

      {/* Confirmation modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="text-child-lg font-bold text-gray-800 mb-4">
          {t.confirmTitle}
        </h2>
        <p className="text-child-base text-gray-700 mb-6">
          {t.confirmDescription}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t.cancel}
          </Button>
          <Button variant="warning" onClick={handleConfirmClear}>
            {t.confirm}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
