import { useMemo } from 'react';

interface Point {
  x: number;
  y: number;
}

interface NodePosition {
  id: number;
  level: number;
  x: number;
  y: number;
}

export function useMapLayout(totalLevels: number) {
  return useMemo(() => {
    const width = 800;
    const height = 600;
    const positions: NodePosition[] = [];

    // Create winding path with some randomness
    for (let i = 0; i < totalLevels; i++) {
      const progress = i / (totalLevels - 1);

      // Winding pattern: sine wave
      const x = 100 + progress * (width - 200);
      const y = height / 2 + Math.sin(progress * Math.PI * 3) * 150;

      positions.push({
        id: i,
        level: i + 1,
        x,
        y,
      });
    }

    // Generate SVG path
    let pathD = `M ${positions[0].x} ${positions[0].y}`;
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2y = curr.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return { positions, pathD, width, height };
  }, [totalLevels]);
}
