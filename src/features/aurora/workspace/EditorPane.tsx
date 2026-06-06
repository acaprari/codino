import type { ParseError } from '../../../core/language';
import { CodeEditor } from '../../editor/CodeEditor';
import { Label } from '../../../components/aurora/Label';
import { ParseErrorCard } from '../inline-errors/ParseErrorCard';
import { RuntimeErrorCard } from '../inline-errors/RuntimeErrorCard';

interface EditorPaneProps {
  code: string;
  onChange: (code: string) => void;
  highlightedLine?: number | null;
  readOnly?: boolean;
  language: 'it' | 'en';
  parseErrors?: ParseError[];
  runtimeError?: { message: string; line: number } | null;
}

export function EditorPane({
  code,
  onChange,
  highlightedLine,
  readOnly = false,
  language,
  parseErrors = [],
  runtimeError = null,
}: EditorPaneProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
      <Label>Editor</Label>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeEditor
          code={code}
          onChange={onChange}
          highlightedLine={highlightedLine ?? null}
          readOnly={readOnly}
        />
      </div>
      {parseErrors.length > 0 && (
        <ParseErrorCard error={parseErrors[0]} language={language} />
      )}
      {runtimeError && (
        <RuntimeErrorCard message={runtimeError.message} line={runtimeError.line} language={language} />
      )}
    </div>
  );
}
