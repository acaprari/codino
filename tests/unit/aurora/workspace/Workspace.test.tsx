import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workspace } from '../../../../src/features/aurora/workspace/Workspace';

describe('Workspace', () => {
  it('renders all four named slots', () => {
    render(
      <Workspace
        topBar={<div data-testid="t">top</div>}
        mainArea={<div data-testid="m">main</div>}
        rightPanel={<div data-testid="r">right</div>}
        bottomBar={<div data-testid="b">bottom</div>}
      />
    );
    expect(screen.getByTestId('t')).toBeInTheDocument();
    expect(screen.getByTestId('m')).toBeInTheDocument();
    expect(screen.getByTestId('r')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });
});
