import type { ReactNode } from 'react';
import { GlassPane } from '../../../components/aurora/GlassPane';

interface BottomBarProps {
  children: ReactNode;
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <GlassPane style={{ padding: '12px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '32px' }}>
        {children}
      </div>
    </GlassPane>
  );
}
