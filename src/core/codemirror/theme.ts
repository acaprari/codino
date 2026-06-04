import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const codinoHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#3b82f6', fontWeight: 'bold' },
  { tag: tags.number, color: '#f59e0b' },
  { tag: tags.string, color: '#10b981' },
  { tag: tags.variableName, color: '#ec4899' },
  { tag: tags.operator, color: '#6366f1' },
]);

export const codinoTheme = [
  syntaxHighlighting(codinoHighlightStyle),
  EditorView.theme({
    '&': {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
    },
    '.cm-content': {
      caretColor: '#60a5fa',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#60a5fa',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#334155',
    },
    '.cm-activeLine': {
      backgroundColor: '#334155',
    },
    '.cm-gutters': {
      backgroundColor: '#0f172a',
      color: '#64748b',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1e293b',
    },
  }),
];
