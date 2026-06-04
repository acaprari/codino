interface VariablesPanelProps {
  variables: Record<string, any>;
}

export function VariablesPanel({ variables }: VariablesPanelProps) {
  const entries = Object.entries(variables);

  if (entries.length === 0) return null;

  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
      <div className="text-child-sm font-bold text-purple-800 mb-2">Variables:</div>
      <div className="space-y-2">
        {entries.map(([name, value]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-child-base text-purple-600 font-mono font-bold">
              {name}
            </span>
            <span className="text-child-sm text-gray-500">=</span>
            <span className="text-child-base text-purple-900 font-mono">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
