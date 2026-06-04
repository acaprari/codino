import { Button } from '../../components/ui/Button';

interface ErrorDisplayProps {
  message: string;
  expected?: string;
  actual?: string;
  onTryAgain: () => void;
  onGetHelp: () => void;
}

export function ErrorDisplay({ message, expected, actual, onTryAgain, onGetHelp }: ErrorDisplayProps) {
  return (
    <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <div className="text-center mb-4">
        <span className="text-5xl">🤔</span>
      </div>

      <h3 className="text-child-lg font-bold text-red-800 mb-4 text-center">
        Not quite right!
      </h3>

      <p className="text-child-base text-red-900 mb-4">
        {message}
      </p>

      {expected && actual && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded p-3">
            <div className="text-child-sm font-bold text-gray-600 mb-1">Expected:</div>
            <div className="text-child-base font-mono">{expected}</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-child-sm font-bold text-gray-600 mb-1">You got:</div>
            <div className="text-child-base font-mono">{actual}</div>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="secondary" onClick={onTryAgain}>
          Try Again
        </Button>
        <Button variant="warning" onClick={onGetHelp}>
          Get Help
        </Button>
      </div>
    </div>
  );
}
