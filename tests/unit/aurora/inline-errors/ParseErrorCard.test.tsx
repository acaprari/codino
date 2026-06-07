import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParseErrorCard } from '../../../../src/features/aurora/inline-errors/ParseErrorCard';
import type { ParseError } from '../../../../src/core/language';

describe('ParseErrorCard', () => {
  it('shows a friendly typo message with suggestion', () => {
    const err: ParseError = { type: 'typo-keyword', line: 1, found: 'RIPETTI', suggestion: 'RIPETI' };
    render(<ParseErrorCard error={err} language="it" />);
    expect(screen.getByText(/RIPETTI/)).toBeInTheDocument();
    expect(screen.getByText(/RIPETI/)).toBeInTheDocument();
    expect(screen.getByText(/riga 1/i)).toBeInTheDocument();
  });

  it('shows a friendly missing-end message', () => {
    const err: ParseError = { type: 'missing-end', line: 3 };
    render(<ParseErrorCard error={err} language="it" />);
    expect(screen.getByText(/FINE/)).toBeInTheDocument();
    expect(screen.getByText(/riga 3/i)).toBeInTheDocument();
  });

  it('shows a generic syntax-error message', () => {
    const err: ParseError = { type: 'syntax-error', line: 2, found: '=' };
    render(<ParseErrorCard error={err} language="en" />);
    expect(screen.getByText(/line 2/i)).toBeInTheDocument();
  });
});
