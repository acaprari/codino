interface MapNodeProps {
  x: number;
  y: number;
  level: number;
  emoji?: string;
  completed: boolean;
  unlocked: boolean;
  onClick?: () => void;
}

export function MapNode({ x, y, level, emoji, completed, unlocked, onClick }: MapNodeProps) {
  const fillColor = completed ? '#4ade80' : unlocked ? '#60a5fa' : '#e5e7eb';
  const strokeColor = completed ? '#22c55e' : unlocked ? '#3b82f6' : '#cbd5e1';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={unlocked && !completed ? onClick : undefined}
      className={unlocked && !completed ? 'cursor-pointer' : ''}
    >
      <circle
        r="30"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3"
        className="transition-all"
      />

      {completed && emoji && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize="24"
        >
          {emoji}
        </text>
      )}

      {!completed && unlocked && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize="20"
          fontWeight="bold"
          fill="#1e293b"
        >
          {level}
        </text>
      )}

      {!unlocked && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize="24"
        >
          🔒
        </text>
      )}
    </g>
  );
}
