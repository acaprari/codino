import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../store/gameStore';

interface ApiKeyInputProps {
  value: string | null;
  onSave: (key: string) => void;
  onTest: (key: string) => Promise<boolean>;
}

export function ApiKeyInput({ value, onSave, onTest }: ApiKeyInputProps) {
  const { language } = useGameStore();
  const [key, setKey] = useState(value || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const text = {
    it: {
      label: 'Chiave API di Anthropic',
      placeholder: 'sk-ant-...',
      warning: '⚠️ La tua chiave API resta nel tuo browser e non viene mai inviata da nessuna parte tranne ad Anthropic. Non condividerla mai con nessuno.',
      success: '✅ La chiave API è valida e salvata!',
      error: '❌ Questa chiave API non funziona. Controllala e riprova.',
      testing: 'Sto provando...',
      testAndSave: 'Prova e salva',
      getKey: 'Ottieni una chiave API da Anthropic →',
    },
    en: {
      label: 'Anthropic API Key',
      placeholder: 'sk-ant-...',
      warning: '⚠️ Your API key stays in your browser and is never sent anywhere except to Anthropic. Never share your API key with anyone.',
      success: '✅ API key is valid and saved!',
      error: "❌ This API key doesn't work. Please check it and try again.",
      testing: 'Testing...',
      testAndSave: 'Test & Save',
      getKey: 'Get an API key from Anthropic →',
    },
  };

  const t = text[language];

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const success = await onTest(key);
      setTestResult(success ? 'success' : 'error');
      if (success) {
        onSave(key);
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
    // Clear stale result when the player edits the field again
    if (testResult) setTestResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-child-base font-bold text-gray-700 mb-2">
          {t.label}
        </label>
        <input
          type="password"
          value={key}
          onChange={handleKeyChange}
          placeholder={t.placeholder}
          className="w-full px-4 py-3 text-child-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-child-sm">
        {t.warning}
      </div>

      {testResult === 'success' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-child-base text-green-800">
          {t.success}
        </div>
      )}

      {testResult === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-child-base text-red-800">
          {t.error}
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleTest}
        disabled={!key || testing}
      >
        {testing ? t.testing : t.testAndSave}
      </Button>

      <div className="text-child-sm text-gray-600">
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline"
        >
          {t.getKey}
        </a>
      </div>
    </div>
  );
}
