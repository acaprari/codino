import { GlassPane } from '../../../components/aurora/GlassPane';

interface TopBarProps {
  level: number;
  totalLevels: number;
  stars: number;
  language: 'it' | 'en';
  onSettingsClick: () => void;
}

const T = {
  it: { level: 'Livello', of: 'di', settings: 'Impostazioni' },
  en: { level: 'Level', of: 'of', settings: 'Settings' },
};

export function TopBar({ level, totalLevels, stars, language, onSettingsClick }: TopBarProps) {
  const t = T[language];
  return (
    <GlassPane style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>Codino</span>
        <span style={{ color: 'var(--aurora-text-tertiary)' }}>·</span>
        <span style={{ color: 'var(--aurora-text-secondary)', fontSize: '13px' }}>
          {t.level} <strong style={{ color: 'var(--aurora-text-primary)' }}>{level}</strong> {t.of} {totalLevels}
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            color: 'var(--aurora-accent-amber)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textShadow: '0 0 14px rgba(253, 224, 71, 0.5)',
          }}
        >
          ⭐ {stars}
        </span>
        <button
          onClick={onSettingsClick}
          aria-label={t.settings}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '17px',
            opacity: 0.75,
            padding: '4px',
          }}
        >
          ⚙️
        </button>
      </div>
    </GlassPane>
  );
}
