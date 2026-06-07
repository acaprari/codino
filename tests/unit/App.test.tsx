import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  it('renders the Aurora workspace', () => {
    render(<App />);
    // Multiple elements may contain "Codino" (TopBar + welcome modal) — use getAllByText
    const matches = screen.getAllByText(/Codino|Benvenuto in Codino|Welcome to Codino/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
