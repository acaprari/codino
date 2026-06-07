import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from '../../../../src/features/aurora/workspace/TopBar';

describe('TopBar', () => {
  it('shows the brand, level indicator, star count, and settings icon', () => {
    render(<TopBar level={3} totalLevels={10} stars={7} onSettingsClick={() => {}} language="it" />);
    expect(screen.getByText('Codino')).toBeInTheDocument();
    expect(screen.getByText(/Livello/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/⭐ 7/)).toBeInTheDocument();
  });

  it('uses English copy when language is en', () => {
    render(<TopBar level={5} totalLevels={10} stars={12} onSettingsClick={() => {}} language="en" />);
    expect(screen.getByText(/Level/)).toBeInTheDocument();
  });

  it('fires onSettingsClick when the gear button is clicked', () => {
    const onSettings = vi.fn();
    render(<TopBar level={3} totalLevels={10} stars={7} onSettingsClick={onSettings} language="it" />);
    fireEvent.click(screen.getByRole('button', { name: /impostazioni|settings/i }));
    expect(onSettings).toHaveBeenCalledOnce();
  });
});
