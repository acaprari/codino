import { useState, useEffect } from 'react';
import { DesktopOnlyGuard } from './DesktopOnlyGuard';
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
import { WelcomeStoryModal } from './modals/WelcomeStoryModal';
import { SettingsModal } from './modals/SettingsModal';
import { MapErrorModal } from './modals/MapErrorModal';
import { WrongOutputModal } from './modals/WrongOutputModal';
import { GameCompleteModal } from './modals/GameCompleteModal';
import { BranchSuccessPopup } from './modals/BranchSuccessPopup';
import { useGameStore } from '../../store/gameStore';
import { useClaudeAPI } from '../../core/api/useClaudeAPI';
import { parseWithErrors, execute } from '../../core/language';
import type { ParseError } from '../../core/language';
import type { Element } from '../../types/game';

const STEP_DURATION_MS = 1500;

type Mode = 'idle' | 'executing' | 'awaiting-rating' | 'celebrating' | 'wrong-output' | 'gen-error' | 'game-complete';

export function AuroraApp() {
  const {
    currentProblem, currentCode, setCode,
    currentLevel, stars, language, completedLevels, chosenElements,
    initialStory, mapStructure,
    setStory, setMapStructure, setProblem, selectElement, completeLevel,
  } = useGameStore();
  const apiClient = useClaudeAPI();

  const [mode, setMode] = useState<Mode>('idle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(!initialStory);

  // Execution state
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [runtimeError, setRuntimeError] = useState<{ message: string; line: number } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Array<{ line: number; output?: string; variables: Record<string, number | string> }>>([]);

  // Outcome state
  const [rating, setRating] = useState<{ stars: number; explanation: string; narrativeBridge: string } | null>(null);
  const [wrongOutput, setWrongOutput] = useState<{ explanation: string; expected: string; actual: string } | null>(null);

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  // branches for the current level from mapStructure (index by completedLevels count)
  const branches = (mapStructure && mapStructure[completedLevels.length])?.branches ?? [];

  // Step animation
  useEffect(() => {
    if (mode !== 'executing') return;
    if (stepIndex >= steps.length) {
      setHighlightedLine(null);
      validateAndRate();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stepIndex, steps]);

  const handleStorySubmit = async (story: string) => {
    setStory(story);
    setWelcomeOpen(false);
    if (!apiClient) return;
    try {
      const result = await apiClient.generateMap({ story, language });
      const ms = result.mapStructure;
      if (!Array.isArray(ms) || ms.length === 0) throw new Error('empty');
      setMapStructure(ms);
    } catch {
      setMode('gen-error');
    }
  };

  const handleStoryIdeas = async (): Promise<string[]> => {
    if (!apiClient) return [];
    try {
      const result = await apiClient.generateStoryIdeas({ language });
      return result.ideas ?? [];
    } catch {
      return [];
    }
  };

  const handleBranchPick = async (element: Element) => {
    // selectElement increments currentLevel internally, so we capture the next level before calling it
    const nextLevel = currentLevel + 1;
    selectElement(element);
    setRating(null);
    setMode('idle');
    setOutput('');
    setVariables({});
    if (!apiClient) return;
    try {
      const problem = await apiClient.generateProblem({
        story: initialStory,
        chosenElements: [...(chosenElements ?? []), element],
        level: nextLevel,
        language,
      });
      setProblem(problem);
    } catch (err) {
      console.error('Failed to generate problem', err);
    }
  };

  const handleRun = () => {
    if (mode !== 'idle' || !currentProblem) return;
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
    setSteps(result.steps ?? []);
    setMode('executing');
  };

  const validateAndRate = async () => {
    if (!currentProblem) { setMode('idle'); return; }
    const actual = output.trim();
    const expected = currentProblem.expectedOutput.trim();

    if (actual !== expected) {
      setMode('awaiting-rating');
      if (!apiClient) {
        setWrongOutput({
          explanation: language === 'it' ? 'Il risultato non è quello atteso.' : "The result doesn't match.",
          expected, actual,
        });
        setMode('wrong-output');
        return;
      }
      try {
        const r = await apiClient.analyzeError({
          problem: currentProblem.narrative,
          code: currentCode,
          expectedOutput: expected,
          actualOutput: actual,
          language,
        });
        setWrongOutput({ explanation: r.explanation, expected, actual });
      } catch {
        setWrongOutput({
          explanation: language === 'it' ? 'Il risultato non è quello atteso.' : "The result doesn't match.",
          expected, actual,
        });
      }
      setMode('wrong-output');
      return;
    }

    // Correct output
    setMode('awaiting-rating');
    const fallback = { stars: 3, explanation: language === 'it' ? 'Ottimo!' : 'Great job!', narrativeBridge: '…' };
    if (!apiClient) {
      completeLevel(currentLevel, fallback.stars);
      setRating(fallback);
      setMode(currentLevel >= 10 ? 'game-complete' : 'celebrating');
      return;
    }
    try {
      const r = await apiClient.rateCode({
        story: initialStory,
        problem: currentProblem.narrative,
        code: currentCode,
        level: currentLevel,
        chosenElement: (chosenElements ?? [])[chosenElements.length - 1] ?? { emoji: '⭐', name: 'star' },
        language,
      });
      completeLevel(currentLevel, r.stars);
      setRating({ stars: r.stars, explanation: r.explanation, narrativeBridge: r.narrativeBridge });
      setMode(currentLevel >= 10 ? 'game-complete' : 'celebrating');
    } catch {
      completeLevel(currentLevel, fallback.stars);
      setRating(fallback);
      setMode(currentLevel >= 10 ? 'game-complete' : 'celebrating');
    }
  };

  const handleHelp = async () => {
    if (!apiClient || !currentProblem) return;
    setHintLoading(true);
    try {
      const r = await apiClient.generateHint({ problem: currentProblem.narrative, code: currentCode, language });
      setHint(r.hint);
    } catch {
      setHint(language === 'it' ? 'Riprova a leggere il problema!' : 'Try reading the problem again!');
    } finally {
      setHintLoading(false);
    }
  };

  const handleWrongRetry = () => {
    setWrongOutput(null);
    setMode('idle');
  };

  const handleRestart = () => {
    useGameStore.getState().resetProgress();
    setMode('idle');
    setRating(null);
    setWelcomeOpen(true);
  };

  return (
    <DesktopOnlyGuard language={language}>
      <>
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
              <div style={{ color: 'var(--aurora-text-tertiary)', fontFamily: 'var(--aurora-font-ui)' }}>
                {language === 'it' ? 'Scegli un elemento dalla mappa per iniziare.' : 'Pick an element on the map to start.'}
              </div>
            )}
            <EditorPane
              code={currentCode}
              onChange={setCode}
              language={language}
              highlightedLine={highlightedLine}
              readOnly={mode === 'executing' || mode === 'awaiting-rating'}
              parseErrors={parseErrors}
              runtimeError={runtimeError}
            />
            {hint && (
              <div style={{
                background: 'rgba(253, 224, 71, 0.10)',
                border: '1px solid rgba(253, 224, 71, 0.25)',
                borderLeft: '3px solid var(--aurora-accent-amber)',
                borderRadius: 'var(--aurora-card-radius)',
                padding: '10px 14px',
                color: 'var(--aurora-text-primary)',
                fontSize: '13.5px',
                lineHeight: 1.5,
                fontFamily: 'var(--aurora-font-ui)',
              }}>
                💡 {hint}
              </div>
            )}
            <RunControls
              onRun={handleRun}
              onHelp={handleHelp}
              running={mode === 'executing' || mode === 'awaiting-rating'}
              helpLoading={hintLoading}
              language={language}
            />
          </GlassPane>
        }
        rightPanel={
          <RightPanel
            mode={mode === 'executing' ? 'execution' : 'help'}
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

      <WelcomeStoryModal
        open={welcomeOpen}
        language={language}
        onSubmit={handleStorySubmit}
        onGetIdeas={apiClient ? handleStoryIdeas : undefined}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MapErrorModal
        open={mode === 'gen-error'}
        language={language}
        onRetry={() => { setMode('idle'); if (initialStory) handleStorySubmit(initialStory); }}
        onOpenSettings={() => { setMode('idle'); setSettingsOpen(true); }}
      />
      {wrongOutput && (
        <WrongOutputModal
          open={mode === 'wrong-output'}
          explanation={wrongOutput.explanation}
          expected={wrongOutput.expected}
          actual={wrongOutput.actual}
          language={language}
          onTryAgain={handleWrongRetry}
          onGetHint={() => { handleWrongRetry(); handleHelp(); }}
        />
      )}
      {rating && mode === 'celebrating' && (
        <BranchSuccessPopup
          open
          stars={rating.stars}
          explanation={rating.explanation}
          narrativeBridge={rating.narrativeBridge}
          branches={branches}
          language={language}
          onPick={handleBranchPick}
        />
      )}
      <GameCompleteModal
        open={mode === 'game-complete'}
        totalStars={totalStars}
        language={language}
        onRestart={handleRestart}
        onClose={() => setMode('idle')}
      />
      </>
    </DesktopOnlyGuard>
  );
}
