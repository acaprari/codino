import { useState } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { Label } from '../../components/aurora/Label';
import { useGameStore } from '../../store/gameStore';

export function AuroraApp() {
  const { currentLevel, stars, language } = useGameStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  void settingsOpen; // will be wired in a later task

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
        <GlassPane style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Label>📖 Problema</Label>
          <div style={{ color: 'var(--aurora-text-secondary)' }}>Main area placeholder</div>
        </GlassPane>
      }
      rightPanel={
        <GlassPane>
          <Label>Aiuto</Label>
          <div style={{ color: 'var(--aurora-text-secondary)' }}>Right panel placeholder</div>
        </GlassPane>
      }
      bottomBar={
        <BottomBar>
          <Label muted>Mappa</Label>
          <div style={{ flex: 1, color: 'var(--aurora-text-tertiary)' }}>Map strip placeholder</div>
        </BottomBar>
      }
    />
  );
}
