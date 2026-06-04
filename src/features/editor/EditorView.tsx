import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ProblemPanel } from './ProblemPanel';
import { CodeEditor } from './CodeEditor';
import { useGameStore } from '../../store/gameStore';
import { ExecutionAnimator } from '../execution/ExecutionAnimator';
import { parse, execute } from '../../core/language';
import type { ExecutionStep } from '../../core/language/types';

interface EditorViewProps {
  onRun: (code: string) => void;
}

export function EditorView({ onRun }: EditorViewProps) {
  const { currentProblem, currentCode, setCode } = useGameStore();
  const [localCode, setLocalCode] = useState(currentCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const handleRun = () => {
    setCode(localCode);
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Parse and execute the code
      const tree = parse(localCode);
      const result = execute(tree, localCode);

      if (result.error) {
        setExecutionError(`Error on line ${result.error.line}: ${result.error.message}`);
        setIsExecuting(false);
      } else {
        setExecutionSteps(result.steps);
      }
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Unknown error');
      setIsExecuting(false);
    }
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
    // Call the parent onRun callback after execution completes
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
        <CodeEditor code={localCode} onChange={setLocalCode} />

        <div className="mt-4 flex justify-between items-center">
          <Button variant="warning" size="md">
            ❓ Need Help?
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={handleRun}
            disabled={isExecuting}
          >
            {isExecuting ? '⏸ Running...' : '▶ RUN'}
          </Button>
        </div>

        {/* Show execution animation */}
        {isExecuting && executionSteps.length > 0 && (
          <ExecutionAnimator
            steps={executionSteps}
            onComplete={handleExecutionComplete}
          />
        )}

        {/* Show execution errors */}
        {executionError && (
          <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="text-child-sm font-bold text-red-800 mb-2">Error:</div>
            <p className="text-child-base text-red-900">{executionError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
