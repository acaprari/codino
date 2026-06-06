import { useState } from 'react';
import { Workspace } from './workspace/Workspace';
import { TopBar } from './workspace/TopBar';
import { BottomBar } from './workspace/BottomBar';
import { GlassPane } from '../../components/aurora/GlassPane';
import { Label } from '../../components/aurora/Label';
import { useGameStore } from '../../store/gameStore';
import { ProblemCard } from './workspace/ProblemCard';
import { EditorPane } from './workspace/EditorPane';
import { RunControls } from './workspace/RunControls';

export function AuroraApp() {
  const { currentLevel, stars, language, currentProblem, currentCode, setCode } = useGameStore();
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
          />
          <RunControls
            onRun={() => { /* wired in Phase E */ }}
            onHelp={() => { /* wired in Phase E */ }}
            language={language}
          />
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
