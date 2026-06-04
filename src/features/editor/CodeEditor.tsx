import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { createEditorState } from '../../core/codemirror/setup';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = createEditorState(code, onChange);
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} className="border-2 border-gray-300 rounded-lg overflow-hidden" />;
}
