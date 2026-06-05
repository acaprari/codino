import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';

export const setHighlightedLine = StateEffect.define<number | null>();

const highlightDecoration = Decoration.line({
  attributes: { class: 'cm-executionLine' },
});

export const lineHighlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightedLine)) {
        if (effect.value === null) return Decoration.none;
        try {
          const line = tr.state.doc.line(effect.value);
          return Decoration.set([highlightDecoration.range(line.from)]);
        } catch {
          return Decoration.none;
        }
      }
    }
    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

export const executionLineTheme = EditorView.theme({
  '.cm-executionLine': {
    backgroundColor: 'rgba(234, 179, 8, 0.3) !important',
    borderRadius: '2px',
  },
});
