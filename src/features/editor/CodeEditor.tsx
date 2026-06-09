import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { createEditorState } from '../../core/codemirror/setup';
import { setHighlightedLine } from '../../core/codemirror/lineHighlight';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  highlightedLine?: number | null;
  readOnly?: boolean;
}

export function CodeEditor({ code, onChange, highlightedLine, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const state = createEditorState(code, onChange, readOnly);
    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync editor content when the prop changes externally (e.g. level reset).
  // Guard skips when the editor already matches to avoid fighting user input.
  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current === code) return;
    viewRef.current.dispatch({
      changes: { from: 0, to: current.length, insert: code },
    });
  }, [code]);

  // Dispatch highlight effect whenever the prop changes
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: setHighlightedLine.of(highlightedLine ?? null),
    });
  }, [highlightedLine]);

  return <div ref={editorRef} style={{ height: '100%', borderRadius: '10px', overflow: 'hidden' }} />;
}
