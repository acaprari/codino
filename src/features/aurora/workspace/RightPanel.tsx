import type { ReactNode } from 'react';
import { GlassPane } from '../../../components/aurora/GlassPane';

interface RightPanelProps {
  mode: 'help' | 'execution';
  help: ReactNode;
  execution: ReactNode;
}

export function RightPanel({ mode, help, execution }: RightPanelProps) {
  return (
    <GlassPane style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
      <div
        className="aurora-anim"
        style={{
          opacity: mode === 'help' ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: mode === 'help' ? 'auto' : 'none',
          position: mode === 'help' ? 'static' : 'absolute',
          inset: 0,
          padding: mode === 'help' ? 0 : 'var(--aurora-pane-padding)',
          display: mode === 'help' ? 'flex' : 'block',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        {help}
      </div>
      <div
        className="aurora-anim"
        style={{
          opacity: mode === 'execution' ? 1 : 0,
          transition: 'opacity 300ms ease',
          transitionDelay: mode === 'execution' ? '200ms' : '0ms',
          pointerEvents: mode === 'execution' ? 'auto' : 'none',
          position: mode === 'execution' ? 'static' : 'absolute',
          inset: 0,
          padding: mode === 'execution' ? 0 : 'var(--aurora-pane-padding)',
          display: mode === 'execution' ? 'flex' : 'block',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        {execution}
      </div>
    </GlassPane>
  );
}
