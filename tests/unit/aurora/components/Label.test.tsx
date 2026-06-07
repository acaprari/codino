import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../../../../src/components/aurora/Label';

describe('Label', () => {
  it('renders children with uppercase + letter-spacing treatment', () => {
    render(<Label>Aiuto · Linguaggio</Label>);
    const el = screen.getByText('Aiuto · Linguaggio');
    expect(el.style.textTransform).toBe('uppercase');
    expect(el.style.letterSpacing).toBe('0.9px');
  });

  it('uses brand pink color by default', () => {
    render(<Label>X</Label>);
    const el = screen.getByText('X');
    expect(el.style.color).toContain('aurora-accent-pink');
  });

  it('uses muted color when muted=true', () => {
    render(<Label muted>X</Label>);
    const el = screen.getByText('X');
    expect(el.style.color).toContain('aurora-text-tertiary');
  });
});
