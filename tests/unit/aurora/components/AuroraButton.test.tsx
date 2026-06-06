import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuroraButton } from '../../../../src/components/aurora/AuroraButton';

describe('AuroraButton', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<AuroraButton onClick={onClick}>Run</AuroraButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<AuroraButton onClick={onClick} disabled>Run</AuroraButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies primary variant by default', () => {
    render(<AuroraButton>Run</AuroraButton>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('primary');
  });

  it('applies ghost variant when specified', () => {
    render(<AuroraButton variant="ghost">Help</AuroraButton>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-variant')).toBe('ghost');
  });
});
