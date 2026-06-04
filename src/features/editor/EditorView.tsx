import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ProblemPanel } from './ProblemPanel';
import { CodeEditor } from './CodeEditor';
import { useGameStore } from '../../store/gameStore';

interface EditorViewProps {
  onRun: (code: string) => void;
}

export function EditorView({ onRun }: EditorViewProps) {
  const { currentProblem, currentCode, setCode } = useGameStore();
  const [localCode, setLocalCode] = useState(currentCode);

  const handleRun = () => {
    setCode(localCode);
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
          <Button variant="success" size="lg" onClick={handleRun}>
            ▶ RUN
          </Button>
        </div>
      </div>
    </div>
  );
}
