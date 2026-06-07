import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemCard } from '../../../../src/features/aurora/workspace/ProblemCard';

describe('ProblemCard', () => {
  it('renders the narrative and expected output', () => {
    render(
      <ProblemCard
        narrative="Il drago ha 5 monete d'oro."
        expectedOutput="8"
        language="it"
      />
    );
    expect(screen.getByText("Il drago ha 5 monete d'oro.")).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows the bilingual problem label in Italian', () => {
    render(<ProblemCard narrative="x" expectedOutput="1" language="it" />);
    expect(screen.getByText(/Problema/)).toBeInTheDocument();
  });

  it('shows the bilingual problem label in English', () => {
    render(<ProblemCard narrative="x" expectedOutput="1" language="en" />);
    expect(screen.getByText(/Problem/)).toBeInTheDocument();
  });
});
