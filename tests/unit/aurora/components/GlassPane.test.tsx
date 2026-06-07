import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassPane } from '../../../../src/components/aurora/GlassPane';

describe('GlassPane', () => {
  it('renders children inside a glass surface', () => {
    render(<GlassPane><span data-testid="child">hello</span></GlassPane>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses the elevated style when elevated prop is true', () => {
    const { container } = render(<GlassPane elevated>x</GlassPane>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('aurora-glass-elevated');
  });

  it('forwards className to the root element', () => {
    const { container } = render(<GlassPane className="extra-class">x</GlassPane>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('extra-class');
  });
});
