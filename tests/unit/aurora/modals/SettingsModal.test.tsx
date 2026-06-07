import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { SettingsModal } from '../../../../src/features/aurora/modals/SettingsModal';
import { useGameStore } from '../../../../src/store/gameStore';
import { ClaudeAPIClient } from '../../../../src/core/api/claude';

// Spy on the prototype method directly — this works regardless of how the
// component instantiates ClaudeAPIClient (`new ClaudeAPIClient(key)` is fine;
// the prototype is still the one we spy on).
const testConnectionSpy = vi.spyOn(ClaudeAPIClient.prototype, 'testConnection');

const noop = () => {};

describe('SettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetProgress();
    useGameStore.getState().setApiKey(null as unknown as string);
    useGameStore.getState().setLanguage('en');
    testConnectionSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  // settings INV-04: API key input is type="password"
  it('renders the API key input as type="password" (INV-04)', () => {
    render(<SettingsModal open onClose={noop} />);
    const input = screen.getByPlaceholderText('sk-ant-…') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  // settings INV-01: key persisted only after successful testConnection
  // ai-integration INV-10: testConnection does not persist; SettingsModal does, after success
  it('persists the API key to the store only after testConnection succeeds (INV-01)', async () => {
    testConnectionSpy.mockResolvedValue(undefined);
    render(<SettingsModal open onClose={noop} />);

    const input = screen.getByPlaceholderText('sk-ant-…');
    fireEvent.change(input, { target: { value: 'sk-ant-new-key' } });

    // Not persisted yet — only typing.
    expect(useGameStore.getState().apiKey).toBeNull();

    fireEvent.click(screen.getByText('Test & Save'));

    await waitFor(() => {
      expect(testConnectionSpy).toHaveBeenCalledOnce();
    });
    // After the resolved promise settles, the success banner appears and the key is persisted.
    await waitFor(() => {
      expect(screen.getByText(/valid and saved/i)).toBeInTheDocument();
    });
    expect(useGameStore.getState().apiKey).toBe('sk-ant-new-key');
  });

  it('does not persist the API key when testConnection fails (INV-01)', async () => {
    testConnectionSpy.mockRejectedValue(new Error('auth'));
    render(<SettingsModal open onClose={noop} />);

    const input = screen.getByPlaceholderText('sk-ant-…');
    fireEvent.change(input, { target: { value: 'sk-ant-bad-key' } });

    fireEvent.click(screen.getByText('Test & Save'));

    await waitFor(() => {
      expect(screen.getByText(/doesn't work/i)).toBeInTheDocument();
    });
    expect(useGameStore.getState().apiKey).toBeNull();
  });

  // settings INV-03: Clear Progress requires confirmation sub-modal
  it('does not call resetProgress until the confirmation sub-modal is confirmed (INV-03)', () => {
    useGameStore.getState().setApiKey('keep-me');
    useGameStore.getState().completeLevel(1, 3);
    expect(useGameStore.getState().completedLevels).toContain(1);

    render(<SettingsModal open onClose={noop} />);

    // Open the confirmation modal — progress should still be intact.
    fireEvent.click(screen.getByText(/Clear All Progress/));
    expect(useGameStore.getState().completedLevels).toContain(1);

    // Cancel — still intact.
    fireEvent.click(screen.getByText('Cancel'));
    expect(useGameStore.getState().completedLevels).toContain(1);

    // Re-open and confirm — now cleared.
    fireEvent.click(screen.getByText(/Clear All Progress/));
    fireEvent.click(screen.getByText('Confirm'));
    expect(useGameStore.getState().completedLevels).toEqual([]);
    // INV-07 cross-check: API key is preserved through reset.
    expect(useGameStore.getState().apiKey).toBe('keep-me');
  });

  // settings INV-02: every visible string comes from the language map.
  // Italian variant smoke test — confirms the language map is honored end to end.
  it('renders Italian copy when language is "it" (INV-02)', () => {
    useGameStore.getState().setLanguage('it');
    render(<SettingsModal open onClose={noop} />);
    expect(screen.getByText('Impostazioni')).toBeInTheDocument();
    expect(screen.getByText('Chiave API di Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Prova e salva')).toBeInTheDocument();
    expect(screen.getByText('⚠️ Cancella tutti i progressi')).toBeInTheDocument();
  });

  it('clears any prior test result when the API key field is edited', async () => {
    testConnectionSpy.mockResolvedValue(undefined);
    render(<SettingsModal open onClose={noop} />);
    const input = screen.getByPlaceholderText('sk-ant-…');

    fireEvent.change(input, { target: { value: 'sk-ant-good' } });
    fireEvent.click(screen.getByText('Test & Save'));
    await waitFor(() => expect(screen.getByText(/valid and saved/i)).toBeInTheDocument());

    fireEvent.change(input, { target: { value: 'sk-ant-good-edited' } });
    expect(screen.queryByText(/valid and saved/i)).not.toBeInTheDocument();
  });

  it('uses the English aria-label for the close button when language is en', () => {
    render(<SettingsModal open onClose={noop} />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('uses the Italian aria-label for the close button when language is it', () => {
    useGameStore.getState().setLanguage('it');
    cleanup();
    render(<SettingsModal open onClose={noop} />);
    expect(screen.getByLabelText('Chiudi')).toBeInTheDocument();
  });
});
