import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { codinoTheme } from './theme';
import { lineHighlightField, executionLineTheme } from './lineHighlight';
import { codinoLanguageSupport } from '../language/grammar';
import { codinoAutocomplete } from './autocomplete';

export function createEditorState(
  initialCode: string,
  onChange: (code: string) => void,
  readOnly = false
) {
  return EditorState.create({
    doc: initialCode,
    extensions: [
      codinoLanguageSupport(),
      codinoAutocomplete,
      lineNumbers(),
      lineHighlightField,
      executionLineTheme,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !readOnly) {
          onChange(update.state.doc.toString());
        }
      }),
      keymap.of(defaultKeymap),
      codinoTheme,
      EditorView.theme({
        '&': {
          fontSize: '15px',
          fontFamily: 'var(--aurora-font-code, "JetBrains Mono", monospace)',
          height: '100%',
        },
        '.cm-editor': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': {
          padding: '10px',
        },
        '.cm-gutters': {
          fontSize: '13px',
          backgroundColor: 'rgba(0, 0, 0, 0.18)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      }),
      ...(readOnly
        ? [EditorView.editable.of(false), EditorState.readOnly.of(true)]
        : []),
    ],
  });
}
