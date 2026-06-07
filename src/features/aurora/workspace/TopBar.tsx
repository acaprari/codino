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
        <div style={{ width: '1px', height: '18px', background: 'var(--aurora-glass-border)', margin: '0 4px' }} />
        <button
          onClick={onSettingsClick}
          aria-label={t.settings}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--aurora-glass-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '5px 9px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ⚙️
        </button>
      </div>
    </GlassPane>
  );
}
