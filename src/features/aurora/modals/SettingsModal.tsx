import { useState } from 'react';
import { AuroraModal } from '../../../components/aurora/AuroraModal';
import { AuroraButton } from '../../../components/aurora/AuroraButton';
import { ClaudeAPIClient } from '../../../core/api/claude';
import { useGameStore } from '../../../store/gameStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const T = {
  it: {
    title: 'Impostazioni',
    apiKey: 'Chiave API di Anthropic',
    warning: '⚠️ La tua chiave API resta nel tuo browser e non viene mai inviata da nessuna parte tranne ad Anthropic.',
    testSave: 'Prova e salva',
    testing: 'Sto provando…',
    success: '✅ La chiave API è valida e salvata!',
    error: '❌ Questa chiave API non funziona. Riprova.',
    language: 'Lingua',
    italian: 'Italiano',
    english: 'Inglese',
    clear: 'Cancella progressi',
    clearDesc: 'Verranno cancellati la tua storia e tutti i progressi. La tua chiave API sarà mantenuta.',
    clearBtn: '⚠️ Cancella tutti i progressi',
    confirmTitle: 'Sei sicuro?',
    confirmDesc: 'Non si può tornare indietro.',
    cancel: 'Annulla',
    confirm: 'Conferma',
    close: 'Chiudi',
  },
  en: {
    title: 'Settings',
    apiKey: 'Anthropic API Key',
    warning: '⚠️ Your API key stays in your browser and is never sent anywhere except to Anthropic.',
    testSave: 'Test & Save',
    testing: 'Testing…',
    success: '✅ API key is valid and saved!',
    error: "❌ This API key doesn't work. Please retry.",
    language: 'Language',
    italian: 'Italian',
    english: 'English',
    clear: 'Clear Progress',
    clearDesc: 'This will delete your story and all progress. Your API key will be kept.',
    clearBtn: '⚠️ Clear All Progress',
    confirmTitle: 'Are you sure?',
    confirmDesc: 'There is no way to undo this.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
  },
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { apiKey, setApiKey, language, setLanguage, resetProgress } = useGameStore();
  const [key, setKey] = useState(apiKey ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const t = T[language];

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await new ClaudeAPIClient(key).testConnection();
      setTestResult('success');
      setApiKey(key);
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const sectionLabelStyle = {
    fontSize: '14px',
    fontWeight: 700,
    marginBottom: '10px',
    color: 'var(--aurora-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    fontFamily: 'var(--aurora-font-ui)',
  };

  return (
    <>
      <AuroraModal open={open} onClose={onClose} dismissible maxWidth={580}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--aurora-text-primary)', fontFamily: 'var(--aurora-font-ui)', margin: 0 }}>{t.title}</h2>
          <button
            onClick={onClose}
            aria-label={t.close}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--aurora-text-tertiary)', fontSize: '17px' }}
          >
            ✕
          </button>
        </div>

        <section style={{ marginBottom: '28px' }}>
          <div style={sectionLabelStyle}>{t.apiKey}</div>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); if (testResult) setTestResult(null); }}
            placeholder="sk-ant-…"
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--aurora-glass-border)',
              borderRadius: 'var(--aurora-card-radius)',
              color: 'var(--aurora-text-primary)',
              fontFamily: 'var(--aurora-font-code)',
              fontSize: '13px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ background: 'rgba(253, 224, 71, 0.08)', borderLeft: '3px solid var(--aurora-accent-amber)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '12.5px', color: 'var(--aurora-text-secondary)', marginBottom: '12px', fontFamily: 'var(--aurora-font-ui)' }}>
            {t.warning}
          </div>
          {testResult === 'success' && (
            <div style={{ background: 'rgba(110, 231, 183, 0.10)', borderLeft: '3px solid var(--aurora-accent-success)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '13px', color: 'var(--aurora-text-primary)', marginBottom: '12px', fontFamily: 'var(--aurora-font-ui)' }}>
              {t.success}
            </div>
          )}
          {testResult === 'error' && (
            <div style={{ background: 'rgba(253, 164, 175, 0.10)', borderLeft: '3px solid var(--aurora-accent-error)', padding: '10px 14px', borderRadius: 'var(--aurora-card-radius)', fontSize: '13px', color: 'var(--aurora-text-primary)', marginBottom: '12px', fontFamily: 'var(--aurora-font-ui)' }}>
              {t.error}
            </div>
          )}
          <AuroraButton variant="primary" onClick={handleTest} disabled={!key || testing}>
            {testing ? t.testing : t.testSave}
          </AuroraButton>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <div style={sectionLabelStyle}>{t.language}</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['it', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: language === lang ? 'rgba(240, 171, 252, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: language === lang ? '1px solid var(--aurora-accent-pink)' : '1px solid var(--aurora-glass-border)',
                  borderRadius: 'var(--aurora-card-radius)',
                  cursor: 'pointer',
                  color: 'var(--aurora-text-primary)',
                  fontWeight: 600,
                  fontFamily: 'var(--aurora-font-ui)',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{lang === 'it' ? '🇮🇹' : '🇬🇧'}</div>
                {lang === 'it' ? t.italian : t.english}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div style={sectionLabelStyle}>{t.clear}</div>
          <p style={{ fontSize: '13px', color: 'var(--aurora-text-secondary)', marginBottom: '12px', lineHeight: 1.5, fontFamily: 'var(--aurora-font-ui)' }}>{t.clearDesc}</p>
          <AuroraButton variant="ghost" onClick={() => setConfirmOpen(true)}>{t.clearBtn}</AuroraButton>
        </section>
      </AuroraModal>

      <AuroraModal open={confirmOpen} onClose={() => setConfirmOpen(false)} dismissible maxWidth={420}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--aurora-text-primary)', fontFamily: 'var(--aurora-font-ui)' }}>{t.confirmTitle}</h3>
        <p style={{ fontSize: '14px', color: 'var(--aurora-text-secondary)', marginBottom: '20px', fontFamily: 'var(--aurora-font-ui)' }}>{t.confirmDesc}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <AuroraButton variant="ghost" onClick={() => setConfirmOpen(false)}>{t.cancel}</AuroraButton>
          <AuroraButton
            variant="primary"
            onClick={() => { resetProgress(); setConfirmOpen(false); onClose(); }}
          >
            {t.confirm}
          </AuroraButton>
        </div>
      </AuroraModal>
    </>
  );
}
