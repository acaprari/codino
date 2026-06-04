import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { WelcomeScreen } from './features/story/WelcomeScreen';
import { StoryInput } from './features/story/StoryInput';
import { MapView } from './features/map/MapView';
import { EditorView } from './features/editor/EditorView';
import { SuccessScreen } from './features/execution/SuccessScreen';
import { ErrorDisplay } from './features/execution/ErrorDisplay';
import { ExecutionAnimator } from './features/execution/ExecutionAnimator';
import { SettingsView } from './features/settings/SettingsView';
import { useGameStore } from './store/gameStore';
import { useClaudeAPI } from './core/api/useClaudeAPI';
import { parse, execute } from './core/language';

type Screen = 'welcome' | 'story' | 'map' | 'editor' | 'executing' | 'success' | 'error' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    initialStory,
    currentLevel,
    chosenElements,
    language,
    setStory,
    setMapStructure,
    selectElement,
    setProblem,
    completeLevel
  } = useGameStore();

  const apiClient = useClaudeAPI();

  const handleStorySubmit = async (story: string) => {
    setStory(story);

    if (apiClient) {
      try {
        const { mapStructure } = await apiClient.generateMap({ story, language });
        setMapStructure(mapStructure);
      } catch (error) {
        console.error('Failed to generate map:', error);
      }
    }

    setScreen('map');
  };

  const handleNodeClick = async (level: number) => {
    if (!apiClient) {
      alert('Please set your API key in Settings first!');
      setScreen('settings');
      return;
    }

    // For now, use mock element selection
    const mockElement = { emoji: '⭐', name: 'star' };
    selectElement(mockElement);

    try {
      const problem = await apiClient.generateProblem({
        story: initialStory,
        chosenElements: [...chosenElements, mockElement],
        level,
        language,
      });

      setProblem(problem);
      setScreen('editor');
    } catch (error) {
      console.error('Failed to generate problem:', error);
      alert('Failed to generate problem. Please check your API key.');
    }
  };

  const handleRunCode = async (code: string) => {
    try {
      const tree = parse(code);
      const result = execute(tree, code);

      if (result.error) {
        setErrorMessage(`Error on line ${result.error.line}: ${result.error.message}`);
        setExecutionResult(result);
        setScreen('error');
        return;
      }

      setExecutionResult(result);
      setScreen('executing');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setScreen('error');
    }
  };

  const handleExecutionComplete = async () => {
    const { currentProblem } = useGameStore.getState();

    if (!currentProblem || !executionResult) return;

    // Check if output matches expected
    const actualOutput = executionResult.output.join('\n').trim();
    const expectedOutput = currentProblem.expectedOutput.trim();

    if (actualOutput === expectedOutput) {
      if (apiClient) {
        try {
          const rating = await apiClient.rateCode({
            problem: currentProblem.narrative,
            code: executionResult.output.join('\n'),
            language,
          });

          completeLevel(currentLevel, rating.stars);
          setExecutionResult({ ...executionResult, ...rating });
          setScreen('success');
        } catch (error) {
          console.error('Failed to rate code:', error);
          // Default to success with 3 stars if rating fails
          completeLevel(currentLevel, 3);
          setExecutionResult({
            ...executionResult,
            stars: 3,
            explanation: 'Great job!',
            narrativeBridge: 'Your adventure continues...'
          });
          setScreen('success');
        }
      }
    } else {
      setErrorMessage('Your output doesn\'t match the expected result.');
      setScreen('error');
    }
  };

  return (
    <AppLayout onSettingsClick={() => setScreen('settings')}>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => setScreen('story')} />
      )}

      {screen === 'story' && (
        <StoryInput onSubmit={handleStorySubmit} />
      )}

      {screen === 'map' && (
        <MapView onNodeClick={handleNodeClick} />
      )}

      {screen === 'editor' && (
        <EditorView onRun={handleRunCode} />
      )}

      {screen === 'executing' && executionResult && (
        <div className="max-w-4xl mx-auto">
          <ExecutionAnimator
            steps={executionResult.steps}
            onComplete={handleExecutionComplete}
          />
        </div>
      )}

      {screen === 'success' && executionResult && (
        <SuccessScreen
          stars={executionResult.stars || 3}
          explanation={executionResult.explanation || 'Great job!'}
          narrativeBridge={executionResult.narrativeBridge || 'Your adventure continues...'}
          onContinue={() => setScreen('map')}
        />
      )}

      {screen === 'error' && (
        <div className="max-w-4xl mx-auto">
          <ErrorDisplay
            message={errorMessage}
            expected={useGameStore.getState().currentProblem?.expectedOutput}
            actual={executionResult?.output?.join('\n')}
            onTryAgain={() => setScreen('editor')}
            onGetHelp={() => alert('Help feature coming soon!')}
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
