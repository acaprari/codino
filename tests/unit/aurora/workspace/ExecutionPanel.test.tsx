import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExecutionPanel } from '../../../../src/features/aurora/workspace/ExecutionPanel';

describe('ExecutionPanel', () => {
  it('renders string values in double quotes with the success color', () => {
    render(<ExecutionPanel output="" variables={{ name: 'Alice' }} language="en" />);
    const valueSpan = screen.getByText('"Alice"');
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan).toHaveStyle({ color: 'var(--aurora-accent-success)' });
  });

  it('renders number values without quotes in the amber color', () => {
    render(<ExecutionPanel output="" variables={{ count: 5 }} language="en" />);
    const valueSpan = screen.getByText('5');
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan).toHaveStyle({ color: 'var(--aurora-accent-amber)' });
  });

  it('renders mixed string and number variables with the correct formatting for each', () => {
    render(
      <ExecutionPanel
        output=""
        variables={{ name: 'Bob', count: 42 }}
        language="en"
      />
    );
    const stringValue = screen.getByText('"Bob"');
    const numberValue = screen.getByText('42');
    expect(stringValue).toHaveStyle({ color: 'var(--aurora-accent-success)' });
    expect(numberValue).toHaveStyle({ color: 'var(--aurora-accent-amber)' });
  });

  it('shows the empty placeholder when output is blank', () => {
    render(<ExecutionPanel output="" variables={{}} language="en" />);
    expect(screen.getAllByText('(empty)').length).toBeGreaterThan(0);
  });

  it('shows the empty placeholder in Italian when language is it', () => {
    render(<ExecutionPanel output="" variables={{}} language="it" />);
    expect(screen.getAllByText('(vuoto)').length).toBeGreaterThan(0);
  });
});
