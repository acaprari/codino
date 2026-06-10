import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const codinoHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--aurora-code-keyword)', fontWeight: 'bold' },
  { tag: tags.number, color: 'var(--aurora-code-number)' },
  { tag: tags.string, color: 'var(--aurora-code-string)' },
  { tag: tags.variableName, color: 'var(--aurora-code-identifier)' },
  { tag: tags.operator, color: 'var(--aurora-code-operator)' },
]);

export const codinoTheme = [
  syntaxHighlighting(codinoHighlightStyle),
  EditorView.theme({
    '&': {
      backgroundColor: 'var(--aurora-editor-bg)',
      color: 'var(--aurora-editor-fg)',
    },
    '.cm-content': {
      caretColor: 'var(--aurora-editor-caret)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--aurora-editor-caret)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'var(--aurora-editor-selection)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--aurora-editor-selection)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--aurora-editor-gutter-bg)',
      color: 'var(--aurora-editor-gutter-fg)',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--aurora-editor-bg)',
    },
  }),
];
