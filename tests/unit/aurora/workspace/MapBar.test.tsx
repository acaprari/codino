import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapBar } from '../../../../src/features/aurora/workspace/MapBar';

describe('MapBar', () => {
  it('renders exactly 10 level nodes', () => {
    const { container } = render(<MapBar completedLevels={[]} currentLevel={1} chosenElements={[]} language="it" />);
    const nodes = container.querySelectorAll('[data-node]');
    expect(nodes.length).toBe(10);
  });

  it('marks completed levels with their chosen emoji', () => {
    render(
      <MapBar
        completedLevels={[1, 2]}
        currentLevel={3}
        chosenElements={[
          { emoji: '🏰', name: 'castello' },
          { emoji: '⚔️', name: 'spada' },
        ]}
        language="it"
      />
    );
    expect(screen.getByText('🏰')).toBeInTheDocument();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('shows the level number on the current node', () => {
    render(<MapBar completedLevels={[1]} currentLevel={2} chosenElements={[{ emoji: '🏰', name: 'castle' }]} language="en" />);
    const currentNode = screen.getByTestId('node-current');
    expect(currentNode.textContent).toBe('2');
  });
});
