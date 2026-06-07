import { AuroraButton } from '../../../components/aurora/AuroraButton';

interface RunControlsProps {
  onRun: () => void;
  onHelp: () => void;
  running?: boolean;
  helpLoading?: boolean;
  language: 'it' | 'en';
}

const T = {
  it: { help: '❓ AIUTO', helpWait: '⏳ PENSANDO…', run: '▶ ESEGUI', running: '▶ ESEGUENDO…' },
  en: { help: '❓ HELP',  helpWait: '⏳ THINKING…', run: '▶ RUN',    running: '▶ RUNNING…'   },
};

export function RunControls({ onRun, onHelp, running = false, helpLoading = false, language }: RunControlsProps) {
  const t = T[language];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
      <AuroraButton variant="ghost" onClick={onHelp} disabled={helpLoading || running}>
        {helpLoading ? t.helpWait : t.help}
      </AuroraButton>
      <div style={{ flex: 1 }} />
      <AuroraButton variant="primary" onClick={onRun} disabled={running}>
        {running ? t.running : t.run}
      </AuroraButton>
    </div>
  );
}
