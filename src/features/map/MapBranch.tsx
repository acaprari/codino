import type { Element } from '../../types/game';

interface MapBranchProps {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  element: Element;
  onClick: () => void;
}

export function MapBranch({ x, y, fromX, fromY, element, onClick }: MapBranchProps) {
  return (
    <g>
      {/* Dashed connector from last completed node (or start) to this branch */}
      <line
        x1={fromX}
        y1={fromY}
        x2={x}
        y2={y}
        stroke="#93c5fd"
        strokeWidth="3"
        strokeDasharray="6 4"
      />

      {/* Clickable branch node */}
      <g
        transform={`translate(${x}, ${y})`}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <circle
          r="32"
          fill="#60a5fa"
          stroke="#2563eb"
          strokeWidth="3"
        />
        <text textAnchor="middle" dy="0.35em" fontSize="22">
          {element.emoji}
        </text>
        {/* Element name label below circle */}
        <text
          textAnchor="middle"
          y={48}
          fontSize="13"
          fontWeight="bold"
          fill="#1e40af"
        >
          {element.name}
        </text>
      </g>
    </g>
  );
}
