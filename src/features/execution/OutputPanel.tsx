interface OutputPanelProps {
  output: string;
}

export function OutputPanel({ output }: OutputPanelProps) {
  if (!output) return null;

  return (
    <div className="mt-4 bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <div className="text-child-sm font-bold text-gray-700 mb-2">Output:</div>
      <pre className="text-child-base font-mono whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}
