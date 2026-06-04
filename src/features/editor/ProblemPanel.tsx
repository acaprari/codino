interface ProblemPanelProps {
  narrative: string;
  expectedOutput: string;
}

export function ProblemPanel({ narrative, expectedOutput }: ProblemPanelProps) {
  return (
    <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-6 mb-4">
      <div className="text-child-sm font-bold text-yellow-800 mb-2">
        📖 THE CHALLENGE
      </div>
      <p className="text-child-base text-yellow-900 mb-4">
        {narrative}
      </p>
      <div className="bg-white rounded px-4 py-2 text-child-sm">
        <strong>Expected output:</strong> {expectedOutput}
      </div>
    </div>
  );
}
