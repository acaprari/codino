import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RightPanel } from '../../../../src/features/aurora/workspace/RightPanel';

describe('RightPanel', () => {
  it('shows the help slot when mode is help', () => {
    render(
      <RightPanel
        mode="help"
        help={<div data-testid="h">help</div>}
        execution={<div data-testid="e">exec</div>}
      />
    );
    expect(screen.getByTestId('h')).toBeInTheDocument();
  });

  it('shows the execution slot when mode is execution', () => {
    render(
      <RightPanel
        mode="execution"
        help={<div data-testid="h">help</div>}
        execution={<div data-testid="e">exec</div>}
      />
    );
    expect(screen.getByTestId('e')).toBeInTheDocument();
  });
});
