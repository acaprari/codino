import type { ReactNode } from 'react';

interface WorkspaceProps {
  topBar: ReactNode;
  mainArea: ReactNode;
  rightPanel: ReactNode;
  bottomBar: ReactNode;
}

export function Workspace({ topBar, mainArea, rightPanel, bottomBar }: WorkspaceProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--aurora-pane-gap)',
        padding: 'var(--aurora-pane-gap)',
        height: '100vh',
        maxHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ gridColumn: '1 / -1' }}>{topBar}</div>
      <div style={{ gridRow: 2, minHeight: 0, overflow: 'hidden' }}>{mainArea}</div>
      <div style={{ gridRow: 2, minHeight: 0, overflow: 'hidden' }}>{rightPanel}</div>
      <div style={{ gridColumn: '1 / -1' }}>{bottomBar}</div>
    </div>
  );
}
