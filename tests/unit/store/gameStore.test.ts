import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../../src/store/gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetProgress();
  });

  it('initializes with default state', () => {
    const state = useGameStore.getState();
    expect(state.currentLevel).toBe(0);
    expect(state.completedLevels).toEqual([]);
  });

  it('updates language and persists', () => {
    useGameStore.getState().setLanguage('it');
    expect(useGameStore.getState().language).toBe('it');

    // Verify persistence
    const stored = localStorage.getItem('codino_settings');
    expect(stored).toContain('it');
  });

  it('stores API key', () => {
    useGameStore.getState().setApiKey('test-key');
    expect(useGameStore.getState().apiKey).toBe('test-key');
  });

  it('completes level and stores stars', () => {
    useGameStore.getState().completeLevel(1, 3);
    const state = useGameStore.getState();
    expect(state.completedLevels).toContain(1);
    expect(state.stars[1]).toBe(3);
  });
});
