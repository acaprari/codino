import { useState } from 'react';
import { Button } from '../../components/ui/Button';

interface ApiKeyInputProps {
  value: string | null;
  onSave: (key: string) => void;
  onTest: (key: string) => Promise<boolean>;
}

export function ApiKeyInput({ value, onSave, onTest }: ApiKeyInputProps) {
  const [key, setKey] = useState(value || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const success = await onTest(key);
      setTestResult(success ? 'success' : 'error');
      if (success) {
        onSave(key);
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-child-base font-bold text-gray-700 mb-2">
          Anthropic API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-4 py-3 text-child-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-child-sm">
        ⚠️ Your API key stays in your browser and is never sent anywhere except to Anthropic.
        Never share your API key with anyone.
      </div>

      {testResult === 'success' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-child-base text-green-800">
          ✅ API key is valid and saved!
        </div>
      )}

      {testResult === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-child-base text-red-800">
          ❌ This API key doesn't work. Please check it and try again.
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleTest}
        disabled={!key || testing}
      >
        {testing ? 'Testing...' : 'Test & Save'}
      </Button>

      <div className="text-child-sm text-gray-600">
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline"
        >
          Get an API key from Anthropic →
        </a>
      </div>
    </div>
  );
}
