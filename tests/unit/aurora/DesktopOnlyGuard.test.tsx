import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DesktopOnlyGuard } from '../../../src/features/aurora/DesktopOnlyGuard';

function setWidth(w: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
}

function resize(w: number) {
  act(() => {
    setWidth(w);
    window.dispatchEvent(new Event('resize'));
  });
}

describe('INV-VS-07: DesktopOnlyGuard threshold = 900px', () => {
  beforeEach(() => setWidth(1200));

  it('renders children at exactly the 900px threshold', () => {
    setWidth(900);
    render(
      <DesktopOnlyGuard language="en">
        <div data-testid="content">app</div>
      </DesktopOnlyGuard>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders the fallback card below 900px (en)', () => {
    setWidth(899);
    render(
      <DesktopOnlyGuard language="en">
        <div data-testid="content">app</div>
      </DesktopOnlyGuard>,
    );
    expect(screen.queryByTestId('content')).toBeNull();
    expect(screen.getByText(/Codino needs a larger screen/)).toBeInTheDocument();
  });

  it('renders the fallback card below 900px (it)', () => {
    setWidth(800);
    render(
      <DesktopOnlyGuard language="it">
        <div data-testid="content">app</div>
      </DesktopOnlyGuard>,
    );
    expect(screen.queryByTestId('content')).toBeNull();
    expect(screen.getByText(/Codino richiede uno schermo grande/)).toBeInTheDocument();
  });

  it('flips between children and fallback live on window resize', () => {
    setWidth(1200);
    render(
      <DesktopOnlyGuard language="en">
        <div data-testid="content">app</div>
      </DesktopOnlyGuard>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();

    resize(800);
    expect(screen.queryByTestId('content')).toBeNull();
    expect(screen.getByText(/Codino needs a larger screen/)).toBeInTheDocument();

    resize(1024);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
