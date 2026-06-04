import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { WelcomeScreen } from './features/story/WelcomeScreen';
import { StoryInput } from './features/story/StoryInput';
import { useGameStore } from './store/gameStore';

type Screen = 'welcome' | 'story' | 'map';

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const { setStory } = useGameStore();

  const handleStorySubmit = (story: string) => {
    setStory(story);
    setScreen('map');
    // TODO: Generate map with AI
  };

  return (
    <AppLayout>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={() => setScreen('story')} />
      )}
      {screen === 'story' && (
        <StoryInput onSubmit={handleStorySubmit} />
      )}
      {screen === 'map' && (
        <div className="text-center text-child-lg">Map will go here</div>
      )}
    </AppLayout>
  );
}

export default App;
