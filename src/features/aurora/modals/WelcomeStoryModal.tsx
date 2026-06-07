import { useState } from 'react';
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface WelcomeStoryModalProps {
  open: boolean;
  language: 'it' | 'en';
  onSubmit: (story: string) => void;
  onGetIdeas?: () => Promise<string[]>;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

const T = {
  it: {
    title: 'Benvenuto in Codino!',
    subtitle: 'Racconta la tua avventura.',
    settings: 'Impostazioni',
    ideasDisabled: 'Imposta la chiave API per usare questa funzione',
    noApiKey: 'Serve una chiave API per giocare. Tocca ⚙️ per aggiungerla.',
    placeholder: "C'era una volta…",
    examples: [
      'Un coraggioso cavaliere alla ricerca del tesoro…',
      'Un esploratore spaziale visita pianeti lontani…',
      'Un mago impara nuovi incantesimi…',
    ],
    examplesLabel: 'Esempi',
    ideasButton: "Dammi un'idea 💡",
    ideasLoading: '⏳ Penso…',
    ideasLabel: 'Idee generate',
    submit: "Inizia l'avventura",
  },
  en: {
    title: 'Welcome to Codino!',
    subtitle: 'Tell your adventure.',
    settings: 'Settings',
    ideasDisabled: 'Set an API key to use this feature',
    noApiKey: 'An API key is needed to play. Tap ⚙️ to add one.',
    placeholder: 'Once upon a time…',
    examples: [
      'A brave knight searches for treasure…',
      'A space explorer visits distant planets…',
      'A wizard learns new spells…',
    ],
    examplesLabel: 'Examples',
    ideasButton: 'Give me ideas 💡',
    ideasLoading: '⏳ Thinking…',
    ideasLabel: 'Generated ideas',
    submit: 'Start adventure',
  },
};

export function WelcomeStoryModal({ open, language, onSubmit, onGetIdeas, onOpenSettings, hasApiKey }: WelcomeStoryModalProps) {
  const t = T[language];
  const [story, setStory] = useState('');
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);

  const handleGetIdeas = async () => {
    if (!onGetIdeas) return;
    setIdeasLoading(true);
    try {
      setAiIdeas(await onGetIdeas());
    } catch {
      // silent
    } finally {
      setIdeasLoading(false);
    }
  };

  return (
    <AuroraModal open={open} onClose={() => {}} maxWidth={640}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--aurora-text-primary)', fontFamily: 'var(--aurora-font-ui)', margin: 0 }}>{t.title}</h2>
        <button
          onClick={onOpenSettings}
          aria-label={t.settings}
          title={t.settings}
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
            marginLeft: '12px',
            flexShrink: 0,
          }}
        >
          ⚙️
        </button>
      </div>
      <p style={{ color: 'var(--aurora-text-secondary)', marginBottom: '18px', fontFamily: 'var(--aurora-font-ui)' }}>{t.subtitle}</p>

      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder={t.placeholder}
        maxLength={500}
        style={{
          width: '100%',
          height: '110px',
          padding: '12px 14px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--aurora-glass-border)',
          borderRadius: 'var(--aurora-card-radius)',
          color: 'var(--aurora-text-primary)',
          fontFamily: 'var(--aurora-font-ui)',
          fontSize: '14.5px',
          lineHeight: 1.4,
          resize: 'none',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
        <span style={{ color: 'var(--aurora-text-tertiary)', fontSize: '12px', fontFamily: 'var(--aurora-font-ui)' }}>{story.length} / 500</span>
        <button
          onClick={handleGetIdeas}
          disabled={!onGetIdeas || ideasLoading}
          title={!onGetIdeas ? t.ideasDisabled : undefined}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: onGetIdeas && !ideasLoading ? 'pointer' : 'not-allowed',
            color: onGetIdeas ? 'var(--aurora-accent-pink)' : 'var(--aurora-text-tertiary)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--aurora-font-ui)',
            opacity: onGetIdeas ? 1 : 0.5,
          }}
        >
          {ideasLoading ? t.ideasLoading : t.ideasButton}
        </button>
      </div>

      {aiIdeas.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-success)', marginBottom: '6px', fontFamily: 'var(--aurora-font-ui)' }}>{t.ideasLabel}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {aiIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => setStory(idea)}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(110, 231, 183, 0.15)',
                  border: '1px solid rgba(110, 231, 183, 0.30)',
                  borderRadius: 'var(--aurora-card-radius)',
                  color: 'var(--aurora-accent-success)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--aurora-font-ui)',
                }}
              >
                {idea.length > 40 ? idea.substring(0, 40) + '…' : idea}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--aurora-accent-pink)', marginBottom: '6px', fontFamily: 'var(--aurora-font-ui)' }}>{t.examplesLabel}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {t.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setStory(ex)}
              style={{
                padding: '6px 10px',
                background: 'rgba(240, 171, 252, 0.12)',
                border: '1px solid rgba(240, 171, 252, 0.25)',
                borderRadius: 'var(--aurora-card-radius)',
                color: 'var(--aurora-accent-pink)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'var(--aurora-font-ui)',
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '22px', textAlign: 'center' }}>
        <AuroraButton
          variant="primary"
          onClick={() => story.trim() && hasApiKey && onSubmit(story.trim())}
          disabled={!story.trim() || !hasApiKey}
        >
          {t.submit}
        </AuroraButton>
        {!hasApiKey && (
          <p style={{
            marginTop: '10px',
            fontSize: '13px',
            color: 'var(--aurora-accent-amber)',
            fontFamily: 'var(--aurora-font-ui)',
            lineHeight: 1.4,
          }}>
            {t.noApiKey}
          </p>
        )}
      </div>
    </AuroraModal>
  );
}
