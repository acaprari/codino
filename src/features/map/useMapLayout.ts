import { useMemo } from 'react';
import type { Element, LevelStructure } from '../../types/game';

const WIDTH = 800;
const HEIGHT = 650;
const PADDING_X = 100;
const AMPLITUDE = 120;
const CENTER_Y = 300;

export interface SpineNode {
  level: number;
  x: number;
  y: number;
}

export interface BranchNode {
  element: Element;
  x: number;
  y: number;
  fromX: number;
  fromY: number;
}

export interface MapLayout {
  spineNodes: SpineNode[];
  branchNodes: BranchNode[];
  spinePath: string;
  width: number;
  height: number;
}

function computeSpineX(progress: number): number {
  return PADDING_X + progress * (WIDTH - 2 * PADDING_X);
}

function computeSpineY(progress: number): number {
  return CENTER_Y + Math.sin(progress * Math.PI * 3) * AMPLITUDE;
}

// Spacing between adjacent branch nodes, by branch count
const BRANCH_SPACING: Record<number, number> = { 2: 90, 3: 80, 4: 70 };

export function useMapLayout(
  totalLevels: number,
  completedCount: number,
  mapStructure: LevelStructure[]
): MapLayout {
  return useMemo(() => {
    // Spine positions: one per level along a sine-wave curve
    const spineNodes: SpineNode[] = Array.from({ length: totalLevels }, (_, i) => {
      const progress = totalLevels === 1 ? 0 : i / (totalLevels - 1);
      return { level: i + 1, x: computeSpineX(progress), y: computeSpineY(progress) };
    });

    // SVG path connecting all spine positions via cubic Béziers
    let spinePath = `M ${spineNodes[0].x} ${spineNodes[0].y}`;
    for (let i = 1; i < spineNodes.length; i++) {
      const prev = spineNodes[i - 1];
      const curr = spineNodes[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2x = cp1x;
      spinePath += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Branch nodes for the current frontier (the next level to start)
    const branchNodes: BranchNode[] = [];
    const frontierIdx = completedCount; // 0-based index into spineNodes

    if (frontierIdx < totalLevels && completedCount < totalLevels) {
      const availableBranches = mapStructure[frontierIdx]?.branches ?? [];

      if (availableBranches.length > 0) {
        const frontier = spineNodes[frontierIdx];

        // Direction: incoming vector toward the frontier
        const prev = frontierIdx > 0
          ? spineNodes[frontierIdx - 1]
          : { x: frontier.x - 80, y: frontier.y }; // synthetic start for first level

        const dx = frontier.x - prev.x;
        const dy = frontier.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular unit vector (rotate 90°)
        const px = -dy / len;
        const py = dx / len;

        const numBranches = availableBranches.length;
        const spacing = BRANCH_SPACING[numBranches] ?? 80;

        availableBranches.forEach((element, i) => {
          const offset = (i - (numBranches - 1) / 2) * spacing;
          branchNodes.push({
            element,
            x: frontier.x + px * offset,
            y: frontier.y + py * offset,
            fromX: prev.x,
            fromY: prev.y,
          });
        });
      }
    }

    return { spineNodes, branchNodes, spinePath, width: WIDTH, height: HEIGHT };
  }, [totalLevels, completedCount, mapStructure]);
}
