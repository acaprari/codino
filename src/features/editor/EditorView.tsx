import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ProblemPanel } from './ProblemPanel';
import { CodeEditor } from './CodeEditor';
import { useGameStore } from '../../store/gameStore';

interface EditorViewProps {
  onRun: (code: string) => void;
  onGetHelp: () => void;
  helpLoading?: boolean;
  hint?: string;
}

export function EditorView({ onRun, onGetHelp, helpLoading = false, hint }: EditorViewProps) {
  const { currentProblem, currentCode, setCode } = useGameStore();
  const [localCode, setLocalCode] = useState(currentCode);

  const handleCodeChange = (code: string) => {
    setLocalCode(code);
    setCode(code); // triggers 2-second debounced save to codino_current_level
  };

  const handleRun = () => {
    setCode(localCode); // sync store so handleExecutionComplete reads current code
    onRun(localCode);
  };

  if (!currentProblem) {
    return <div>No problem loaded</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProblemPanel
        narrative={currentProblem.narrative}
        expectedOutput={currentProblem.expectedOutput}
      />

      <div className="bg-white rounded-lg shadow-lg p-4">
        <CodeEditor code={localCode} onChange={handleCodeChange} />

        {hint && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 rounded p-4">
            <p className="text-child-sm text-yellow-900">💡 {hint}</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="warning"
            size="md"
            onClick={onGetHelp}
            disabled={helpLoading}
          >
            {helpLoading ? '⏳ Getting hint...' : '❓ Need Help?'}
          </Button>
          <Button variant="success" size="lg" onClick={handleRun}>
            ▶ RUN
          </Button>
        </div>
      </div>
    </div>
  );
}
