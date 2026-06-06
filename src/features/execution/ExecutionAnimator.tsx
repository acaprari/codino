import { useState, useEffect } from 'react';
import type { ExecutionStep } from '../../core/language/types';
import { OutputPanel } from './OutputPanel';
import { VariablesPanel } from './VariablesPanel';
import { CodeEditor } from '../editor/CodeEditor';

// Pace at which each execution step is displayed before advancing.
// Tuned for 7-8 year olds: long enough to read the highlighted line and
// connect it to the variables/output panel, short enough to stay engaging
// across multi-iteration loops.
const STEP_DURATION_MS = 1500;

interface ExecutionAnimatorProps {
  code: string;
  steps: ExecutionStep[];
  onComplete: () => void;
}

export function ExecutionAnimator({ code, steps, onComplete }: ExecutionAnimatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [highlightedLine, setHighlightedLine] = useState<number | null>(
    steps.length > 0 ? steps[0].line : null
  );

  useEffect(() => {
    if (currentStep >= steps.length) {
      setHighlightedLine(null);
      onComplete();
      return;
    }

    const step = steps[currentStep];
    setHighlightedLine(step.line);

    const timer = setTimeout(() => {
      if (step.output) {
        setOutput((prev) => (prev ? `${prev}\n${step.output}` : step.output!));
      }
      setVariables(step.variables);
      setCurrentStep(currentStep + 1);
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Read-only editor with current line highlighted */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <CodeEditor
          code={code}
          onChange={() => {}}
          highlightedLine={highlightedLine}
          readOnly
        />
      </div>

      {/* Progress */}
      <div className="bg-blue-100 rounded-lg p-3">
        <div className="text-child-sm font-bold text-blue-800 mb-2">
          Running… ({currentStep}/{steps.length})
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all ease-linear"
            style={{ width: `${progress}%`, transitionDuration: `${STEP_DURATION_MS}ms` }}
          />
        </div>
      </div>

      {/* Output and variables */}
      <div className="grid grid-cols-2 gap-4">
        <OutputPanel output={output} />
        <VariablesPanel variables={variables} />
      </div>
    </div>
  );
}
