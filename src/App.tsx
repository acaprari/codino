import { useState } from 'react';
import { AuroraApp } from './features/aurora/AuroraApp';
import { AppLayout } from './components/layout/AppLayout';
import { WelcomeScreen } from './features/story/WelcomeScreen';
import { StoryInput } from './features/story/StoryInput';
import { GeneratingScreen } from './features/story/GeneratingScreen';
import { MapErrorScreen } from './features/story/MapErrorScreen';
import { MapView } from './features/map/MapView';
import { EditorView } from './features/editor/EditorView';
import { SuccessScreen } from './features/execution/SuccessScreen';
import { ErrorDisplay } from './features/execution/ErrorDisplay';
import { ExecutionAnimator } from './features/execution/ExecutionAnimator';
import { SettingsView } from './features/settings/SettingsView';
import { useGameStore } from './store/gameStore';
import { useClaudeAPI } from './core/api/useClaudeAPI';
import { parseWithErrors, execute } from './core/language';
import type { ExecutionResult } from './core/language';
import type { StarRatingResponse, Element } from './core/api/types';

type Screen = 'welcome' | 'story' | 'generating' | 'map-error' | 'map' | 'editor' | 'executing' | 'success' | 'error' | 'settings';

function initialScreen(): Screen {
  const { initialStory, currentProblem } = useGameStore.getState();
  if (currentProblem) return 'editor';
  if (initialStory)   return 'map';
  return 'welcome';
}

interface CompletedExecution {
  result: ExecutionResult;
  rating: StarRatingResponse | null;
}

function App() {
  // Aurora feature flag — when present, render the new workspace
  if (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('ui') === 'aurora') {
    return <AuroraApp />;
  }
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [pendingExecution, setPendingExecution] = useState<ExecutionResult | null>(null);
  const [completedExecution, setCompletedExecution] = useState<CompletedExecution | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorExpected, setErrorExpected] = useState<string | undefined>();
  const [errorActual, setErrorActual] = useState<string | undefined>();
  const [hint, setHint] = useState<string | undefined>();
  const [hintLoading, setHintLoading] = useState(false);

  const {
    initialStory,
    currentLevel,
    chosenElements,
    currentProblem,
    currentCode,
    language,
    setStory,
    setMapStructure,
    selectElement,
    setProblem,
    completeLevel,
  } = useGameStore();

  const apiClient = useClaudeAPI();

  const handleStorySubmit = async (story: string) => {
    setStory(story);
    setScreen('generating'); // show loading feedback immediately

    if (!apiClient) {
      // No key — go to map; the empty-state UI will guide the player
      setScreen('map');
      return;
    }

    try {
      const { mapStructure } = await apiClient.generateMap({ story, language });
      if (!Array.isArray(mapStructure) || mapStructure.length === 0) {
        throw new Error('Empty map structure returned by AI');
      }
      setMapStructure(mapStructure);
      setScreen('map');
    } catch (error) {
      console.error('Failed to generate map:', error);
      setScreen('map-error');
    }
  };

  const handleRetryMap = () => {
    if (initialStory) handleStorySubmit(initialStory);
  };

  const handleBranchClick = async (element: Element) => {
    if (!apiClient) {
      alert('Please set your API key in Settings first!');
      setScreen('settings');
      return;
    }

    // Capture level and elements BEFORE selectElement increments currentLevel
    const nextLevel = currentLevel + 1;
    const allElements = [...chosenElements, element];

    selectElement(element);
    setHint(undefined);

    try {
      const problem = await apiClient.generateProblem({
        story: initialStory,
        chosenElements: allElements,
        level: nextLevel,
        language,
      });

      setProblem(problem);
      setScreen('editor');
    } catch (error) {
      console.error('Failed to generate problem:', error);
      alert('Failed to generate problem. Please check your API key.');
    }
  };

  const handleRunCode = (code: string) => {
    setHint(undefined);

    // Step 1: check for parse errors before executing
    const { tree, errors } = parseWithErrors(code);
    if (errors.length > 0) {
      // Present the first parse error; child-friendly message built by the UI layer
      const first = errors[0];
      let msg = `There's a problem on line ${first.line}.`;
      if (first.type === 'typo-keyword' && first.suggestion) {
        msg = `You wrote "${first.found}" on line ${first.line} — did you mean ${first.suggestion}? 🤔`;
      } else if (first.type === 'missing-end') {
        msg = `Your block on line ${first.line} needs a FINE (or END) at the end! 🤔`;
      }
      setErrorMessage(msg);
      setErrorExpected(undefined);
      setErrorActual(undefined);
      setScreen('error');
      return;
    }

    // Step 2: execute
    const result = execute(tree, code);

    if (result.error) {
      setErrorMessage(`Error on line ${result.error.line}: ${result.error.message}`);
      setErrorExpected(undefined);
      setErrorActual(undefined);
      setPendingExecution(result);
      setScreen('error');
      return;
    }

    setPendingExecution(result);
    setScreen('executing');
  };

  const handleExecutionComplete = async () => {
    if (!currentProblem || !pendingExecution) return;

    const actualOutput = pendingExecution.output.join('\n').trim();
    const expectedOutput = currentProblem.expectedOutput.trim();

    if (actualOutput !== expectedOutput) {
      // Step 4a: output mismatch — call analyzeError for child-friendly explanation
      setErrorExpected(expectedOutput);
      setErrorActual(actualOutput);

      if (apiClient) {
        try {
          const { explanation } = await apiClient.analyzeError({
            problem: currentProblem.narrative,
            code: currentCode,
            expectedOutput,
            actualOutput,
            language,
          });
          setErrorMessage(explanation);
        } catch {
          setErrorMessage("Your output doesn't match the expected result.");
        }
      } else {
        setErrorMessage("Your output doesn't match the expected result.");
      }

      setScreen('error');
      return;
    }

    // Step 5: correct output — rate the code
    if (apiClient) {
      try {
        const rating = await apiClient.rateCode({
          story: initialStory,
          problem: currentProblem.narrative,
          code: currentCode,          // source code, not execution output
          level: currentLevel,
          chosenElement: chosenElements[chosenElements.length - 1] ?? { emoji: '⭐', name: 'star' },
          language,
        });

        completeLevel(currentLevel, rating.stars);
        setCompletedExecution({ result: pendingExecution, rating });
        setScreen('success');
      } catch {
        // Rating failure: complete with 3 stars and placeholder copy
        completeLevel(currentLevel, 3);
        setCompletedExecution({
          result: pendingExecution,
          rating: { stars: 3, explanation: 'Great job!', narrativeBridge: 'Your adventure continues...' },
        });
        setScreen('success');
      }
    }
  };

  const handleGetHelp = async () => {
    if (!apiClient || !currentProblem) return;
    setHintLoading(true);
    try {
      const { hint: hintText } = await apiClient.generateHint({
        problem: currentProblem.narrative,
        code: currentCode,
        language,
      });
      setHint(hintText);
    } catch {
      setHint('Try reading the problem again carefully! 😊');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <AppLayout onSettingsClick={() => setScreen('settings')}>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => setScreen('story')} />
      )}

      {screen === 'story' && (
        <StoryInput
          onSubmit={handleStorySubmit}
          onGetIdeas={apiClient
            ? () => apiClient.generateStoryIdeas({ language }).then(r => r.ideas)
            : undefined}
        />
      )}

      {screen === 'generating' && (
        <GeneratingScreen language={language} />
      )}

      {screen === 'map-error' && (
        <MapErrorScreen
          language={language}
          onRetry={handleRetryMap}
          onSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'map' && (
        <MapView onBranchClick={handleBranchClick} />
      )}

      {screen === 'editor' && (
        <EditorView
          onRun={handleRunCode}
          onGetHelp={handleGetHelp}
          helpLoading={hintLoading}
          hint={hint}
        />
      )}

      {screen === 'executing' && pendingExecution && (
        <ExecutionAnimator
          code={currentCode}
          steps={pendingExecution.steps}
          onComplete={handleExecutionComplete}
        />
      )}

      {screen === 'success' && completedExecution?.rating && (
        <SuccessScreen
          stars={completedExecution.rating.stars}
          explanation={completedExecution.rating.explanation}
          narrativeBridge={completedExecution.rating.narrativeBridge}
          onContinue={() => setScreen('map')}
        />
      )}

      {screen === 'error' && (
        <div className="max-w-4xl mx-auto">
          <ErrorDisplay
            message={errorMessage}
            expected={errorExpected}
            actual={errorActual}
            onTryAgain={() => setScreen('editor')}
            onGetHelp={handleGetHelp}
          />
        </div>
      )}

      {screen === 'settings' && (
        <SettingsView onClose={() => setScreen(initialStory ? 'map' : 'welcome')} />
      )}
    </AppLayout>
  );
}

export default App;
