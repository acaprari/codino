import { useState, useEffect } from 'react';
import type { ExecutionStep } from '../../core/language/types';
import { OutputPanel } from './OutputPanel';
import { VariablesPanel } from './VariablesPanel';

interface ExecutionAnimatorProps {
  steps: ExecutionStep[];
  onComplete: () => void;
}

export function ExecutionAnimator({ steps, onComplete }: ExecutionAnimatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete();
      return;
    }

    const step = steps[currentStep];
    const timer = setTimeout(() => {
      if (step.output) {
        setOutput((prev) => prev ? `${prev}\n${step.output}` : step.output!);
      }
      setVariables(step.variables);
      setCurrentStep(currentStep + 1);
    }, 500); // 500ms per step

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  const progress = steps.length > 0 ? ((currentStep / steps.length) * 100) : 0;

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-blue-100 rounded-lg p-3">
        <div className="text-child-sm font-bold text-blue-800 mb-2">
          Executing... ({currentStep}/{steps.length})
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OutputPanel output={output} />
        <VariablesPanel variables={variables} />
      </div>
    </div>
  );
}
