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

  it('renders keyword examples in the active UI language', () => {
    render(<HelpPanel language="en" currentLevel={5} />);
    // Loops auto-expands at level 5 → English keyword, not Italian
    expect(screen.getByText(/REPEAT 5 TIMES … END/)).toBeInTheDocument();
    expect(screen.queryByText(/RIPETI 5 VOLTE/)).not.toBeInTheDocument();
  });

  it('shows the opposite-language keyword in the cross-language hint card', () => {
    render(<HelpPanel language="en" currentLevel={1} />);
    // Writing auto-expands at level 1; third card hints at the Italian equivalent
    expect(screen.getByText(/^SCRIVI x$/)).toBeInTheDocument();
    expect(screen.getByText(/same in Italian/)).toBeInTheDocument();
  });
});
