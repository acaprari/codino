import { useState, useEffect } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { ProblemCard } from './workspace/ProblemCard';
import { EditorPane } from './workspace/EditorPane';
import { RunControls } from './workspace/RunControls';
import { RightPanel } from './workspace/RightPanel';
import { HelpPanel } from './workspace/HelpPanel';
import { ExecutionPanel } from './workspace/ExecutionPanel';
import { MapBar } from './workspace/MapBar';
import { useGameStore } from '../../store/gameStore';
import { useClaudeAPI } from '../../core/api/useClaudeAPI';
import { parseWithErrors, execute } from '../../core/language';
import type { ParseError } from '../../core/language';

const STEP_DURATION_MS = 1500;

type RightPanelMode = 'help' | 'execution';

export function AuroraApp() {
  const {
    currentProblem, currentCode, setCode,
    currentLevel, completedLevels, chosenElements, stars, language,
  } = useGameStore();
  const apiClient = useClaudeAPI();

  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('help');
  const [running, setRunning] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Array<{ line: number; output?: string; variables: Record<string, number | string> }>>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  void settingsOpen; // wired in Phase G

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  // Step animation
  useEffect(() => {
    if (!running) return;
    if (stepIndex >= steps.length) {
      setHighlightedLine(null);
      setRunning(false);
      setRightPanelMode('help');
      return;
    }
    const step = steps[stepIndex];
    setHighlightedLine(step.line);
    const timer = setTimeout(() => {
      if (step.output) setOutput((o) => (o ? `${o}\n${step.output}` : step.output!));
      setVariables(step.variables);
      setStepIndex((i) => i + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [running, stepIndex, steps]);

  const handleRun = () => {
    if (running || !currentProblem) return;
    setHint(null);
    setRuntimeError(null);
    setOutput('');
    setVariables({});
    setStepIndex(0);

    const { tree, errors } = parseWithErrors(currentCode);
    setParseErrors(errors);
    if (errors.length > 0) return;

    const result = execute(tree, currentCode);
    if (result.error) {
      setRuntimeError({ message: result.error.message, line: result.error.line });
      return;
    }
    setSteps(result.steps);
    setRightPanelMode('execution');
    setRunning(true);
  };

  const handleHelp = async () => {
    if (!apiClient || !currentProblem) return;
    setHintLoading(true);
    try {
      const { hint: text } = await apiClient.generateHint({
        problem: currentProblem.narrative,
        code: currentCode,
        language,
      });
      setHint(text);
    } catch {
      setHint(language === 'it' ? 'Riprova a leggere il problema!' : 'Try reading the problem again!');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <Workspace
      topBar={
        <TopBar
          level={currentLevel}
          totalLevels={10}
          stars={totalStars}
          language={language}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      }
      mainArea={
        <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
          {currentProblem ? (
            <ProblemCard
              narrative={currentProblem.narrative}
              expectedOutput={currentProblem.expectedOutput}
              language={language}
            />
          ) : (
            <div style={{ color: 'var(--aurora-text-tertiary)' }}>
              {language === 'it' ? 'In attesa di un problema…' : 'Waiting for a problem…'}
            </div>
          )}
          <EditorPane
            code={currentCode}
            onChange={setCode}
            language={language}
            highlightedLine={highlightedLine}
            readOnly={running}
            parseErrors={parseErrors}
            runtimeError={runtimeError}
          />
          {hint && (
            <div
              style={{
                background: 'rgba(253, 224, 71, 0.10)',
                border: '1px solid rgba(253, 224, 71, 0.25)',
                borderLeft: '3px solid var(--aurora-accent-amber)',
                borderRadius: 'var(--aurora-card-radius)',
                padding: '10px 14px',
                color: 'var(--aurora-text-primary)',
                fontSize: '13.5px',
                lineHeight: 1.5,
              }}
            >
              💡 {hint}
            </div>
          )}
          <RunControls
            onRun={handleRun}
            onHelp={handleHelp}
            running={running}
            helpLoading={hintLoading}
            language={language}
          />
        </GlassPane>
      }
      rightPanel={
        <RightPanel
          mode={rightPanelMode}
          help={<HelpPanel language={language} currentLevel={Math.max(1, currentLevel)} />}
          execution={<ExecutionPanel output={output} variables={variables} language={language} />}
        />
      }
      bottomBar={
        <BottomBar>
          <MapBar
            completedLevels={completedLevels}
            currentLevel={currentLevel}
            chosenElements={chosenElements}
            language={language}
          />
        </BottomBar>
      }
    />
  );
}
