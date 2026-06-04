import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { WelcomeScreen } from './features/story/WelcomeScreen';
import { StoryInput } from './features/story/StoryInput';
import { MapView } from './features/map/MapView';
import { SettingsView } from './features/settings/SettingsView';
import { useGameStore } from './store/gameStore';

type Screen = 'welcome' | 'story' | 'map' | 'editor' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const { setStory, setMapStructure } = useGameStore();

  const handleStorySubmit = async (story: string) => {
    setStory(story);
    // Mock map structure for now
    setMapStructure([]);
    setScreen('map');
  };

  const handleNodeClick = (level: number) => {
    console.log('Clicked level:', level);
    // TODO: Generate problem and go to editor
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
        <div className="text-center text-child-lg">Editor will go here</div>
      )}
      {screen === 'settings' && (
        <SettingsView onClose={() => setScreen('welcome')} />
      )}
    </AppLayout>
  );
}

export default App;
