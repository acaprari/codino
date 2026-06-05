import { useGameStore } from '../../store/gameStore';
import { useMapLayout } from './useMapLayout';
import { MapPath } from './MapPath';
import { MapNode } from './MapNode';
import { MapBranch } from './MapBranch';
import type { Element } from '../../types/game';

interface MapViewProps {
  onBranchClick: (element: Element) => void;
}

export function MapView({ onBranchClick }: MapViewProps) {
  const { completedLevels, currentLevel, chosenElements, mapStructure } = useGameStore();
  const completedCount = completedLevels.length;

  const { spineNodes, branchNodes, spinePath, width, height } =
    useMapLayout(10, completedCount, mapStructure);

  const gameComplete = completedCount >= 10;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-child-lg font-bold text-purple-600">
        {gameComplete ? '🎉 Adventure Complete!' : `Level ${currentLevel} of 10`}
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white rounded-xl shadow-lg"
      >
        {/* Winding path spine */}
        <MapPath pathD={spinePath} />

        {/* Spine nodes: completed (green) and locked (gray).
            The frontier spine position is omitted when branch nodes are shown there. */}
        {spineNodes.map((node, idx) => {
          const isCompleted = completedLevels.includes(node.level);
          const isFrontier = idx === completedCount && branchNodes.length > 0;

          if (isFrontier) return null; // replaced by branch nodes

          return (
            <MapNode
              key={node.level}
              x={node.x}
              y={node.y}
              level={node.level}
              emoji={isCompleted ? chosenElements[idx]?.emoji : undefined}
              completed={isCompleted}
              unlocked={false}
            />
          );
        })}

        {/* Branch nodes at the frontier — the clickable element choices */}
        {branchNodes.map((branch, idx) => (
          <MapBranch
            key={idx}
            x={branch.x}
            y={branch.y}
            fromX={branch.fromX}
            fromY={branch.fromY}
            element={branch.element}
            onClick={() => onBranchClick(branch.element)}
          />
        ))}

        {/* No branches yet — map generation pending or failed */}
        {!gameComplete && branchNodes.length === 0 && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fontSize="18"
            fill="#9ca3af"
          >
            Generating map…
          </text>
        )}
      </svg>
    </div>
  );
}
