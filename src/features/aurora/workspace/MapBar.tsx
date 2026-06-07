import type { Element } from '../../../types/game';

interface MapBarProps {
  completedLevels: number[];
  currentLevel: number;
  chosenElements: Element[];
  language: 'it' | 'en';
}

const LABEL = { it: 'Mappa', en: 'Map' };

export function MapBar({ completedLevels, currentLevel, chosenElements, language }: MapBarProps) {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const isCompleted = (lvl: number) => completedLevels.includes(lvl);
  const isCurrent = (lvl: number) => lvl === currentLevel && !isCompleted(lvl);

  return (
    <>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.9px',
          color: 'var(--aurora-accent-pink)',
          flexShrink: 0,
        }}
      >
        {LABEL[language]}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
        {levels.map((lvl, idx) => {
          const done = isCompleted(lvl);
          const current = isCurrent(lvl);
          return (
            <span key={lvl} style={{ display: 'contents' }}>
              <div
                data-node
                data-testid={current ? 'node-current' : done ? 'node-done' : 'node-locked'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: current ? '38px' : '32px',
                    height: current ? '38px' : '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: done ? '22px' : '13px',
                    fontWeight: 700,
                    color: done || current ? 'white' : 'var(--aurora-text-tertiary)',
                    background: done
                      ? 'linear-gradient(135deg, var(--aurora-accent-purple), var(--aurora-accent-pink))'
                      : current
                      ? 'linear-gradient(135deg, var(--aurora-accent-amber), #f59e0b)'
                      : 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    boxShadow: done
                      ? '0 0 14px rgba(192, 132, 252, 0.55)'
                      : current
                      ? '0 0 18px rgba(253, 224, 71, 0.70)'
                      : 'none',
                  }}
                >
                  {done ? chosenElements[idx]?.emoji ?? '' : lvl === 10 ? '🏁' : String(lvl)}
                </div>
              </div>
              {idx < levels.length - 1 && (
                <div
                  style={{
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    flex: 0.4,
                    minWidth: '12px',
                    borderRadius: '1px',
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}
