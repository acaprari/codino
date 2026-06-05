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
          fontSize: '18px',
          fontFamily: 'Monaco, Consolas, monospace',
        },
        '.cm-content': {
          minHeight: '300px',
          padding: '10px',
        },
        '.cm-gutters': {
          fontSize: '16px',
          backgroundColor: '#f3f4f6',
        },
      }),
      ...(readOnly
        ? [EditorView.editable.of(false), EditorState.readOnly.of(true)]
        : []),
    ],
  });
}
