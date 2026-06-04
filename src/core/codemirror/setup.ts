import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { codinoTheme } from './theme';

export function createEditorState(initialCode: string, onChange: (code: string) => void) {
  return EditorState.create({
    doc: initialCode,
    extensions: [
      lineNumbers(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
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
    ],
  });
}
