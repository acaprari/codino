import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuroraModal } from '../../../../src/components/aurora/AuroraModal';

describe('AuroraModal', () => {
  it('does not render when open is false', () => {
    render(
      <AuroraModal open={false} onClose={() => {}}>
        <div>content</div>
      </AuroraModal>
    );
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders children when open is true', () => {
    render(
      <AuroraModal open onClose={() => {}}>
        <div>content</div>
      </AuroraModal>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('fires onClose on backdrop click when dismissible', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose} dismissible>
        <div>content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not fire onClose on backdrop click when not dismissible', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose}>
        <div>content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not propagate clicks inside the content', () => {
    const onClose = vi.fn();
    render(
      <AuroraModal open onClose={onClose} dismissible>
        <div data-testid="content">content</div>
      </AuroraModal>
    );
    fireEvent.click(screen.getByTestId('content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
