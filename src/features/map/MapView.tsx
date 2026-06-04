import { useGameStore } from '../../store/gameStore';
import { useMapLayout } from './useMapLayout';
import { MapPath } from './MapPath';
import { MapNode } from './MapNode';

interface MapViewProps {
  onNodeClick: (level: number) => void;
}

export function MapView({ onNodeClick }: MapViewProps) {
  const { completedLevels, currentLevel, chosenElements } = useGameStore();
  const { positions, pathD, width, height } = useMapLayout(10);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-child-lg font-bold text-purple-600">
        Level {currentLevel} of 10
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white rounded-xl shadow-lg"
      >
        <MapPath pathD={pathD} />

        {positions.map((pos, idx) => {
          const completed = completedLevels.includes(pos.level);
          const unlocked = pos.level <= currentLevel + 1;
          const element = chosenElements[idx];

          return (
            <MapNode
              key={pos.id}
              x={pos.x}
              y={pos.y}
              level={pos.level}
              emoji={element?.emoji}
              completed={completed}
              unlocked={unlocked}
              onClick={() => onNodeClick(pos.level)}
            />
          );
        })}
      </svg>
    </div>
  );
}
