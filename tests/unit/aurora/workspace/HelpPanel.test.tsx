import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpPanel } from '../../../../src/features/aurora/workspace/HelpPanel';

describe('HelpPanel', () => {
  it('renders all four category headers in Italian', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    expect(screen.getByText(/Scrivere/)).toBeInTheDocument();
    expect(screen.getByText(/Matematica/)).toBeInTheDocument();
    expect(screen.getByText(/Ripetizioni/)).toBeInTheDocument();
    expect(screen.getByText(/Condizioni/)).toBeInTheDocument();
  });

  it('renders all four category headers in English', () => {
    render(<HelpPanel language="en" currentLevel={1} />);
    expect(screen.getByText(/Writing/)).toBeInTheDocument();
    expect(screen.getByText(/Math/)).toBeInTheDocument();
    expect(screen.getByText(/Loops/)).toBeInTheDocument();
    expect(screen.getByText(/Conditions/)).toBeInTheDocument();
  });

  it('auto-expands the math category at level 3', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    expect(screen.getByText(/somma · sottrai/)).toBeInTheDocument();
  });

  it('lets the user toggle a closed category open', () => {
    render(<HelpPanel language="it" currentLevel={3} />);
    const loopsHeader = screen.getByText(/Ripetizioni/);
    fireEvent.click(loopsHeader);
    expect(screen.getByText(/RIPETI/)).toBeInTheDocument();
  });
});
