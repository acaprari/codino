import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../../../src/store/gameStore';
import { loadSettings, loadProgress } from '../../../src/store/persistence';

const PROBLEM = { narrative: 'Find the treasure!', expectedOutput: '42' };
const ELEMENT = { emoji: '🏰', name: 'castle' };

describe('Game Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetProgress();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── basic state ────────────────────────────────────────────────────────────

  it('initializes with default state', () => {
    const state = useGameStore.getState();
    expect(state.currentLevel).toBe(1);
    expect(state.completedLevels).toEqual([]);
    expect(state.currentProblem).toBeNull();
    expect(state.currentCode).toBe('');
  });

  it('updates language and persists to codino_settings only', () => {
    useGameStore.getState().setLanguage('it');
    expect(useGameStore.getState().language).toBe('it');

    const settings = JSON.parse(localStorage.getItem('codino_settings')!);
    expect(settings.language).toBe('it');
    // settings must not contain progress fields
    expect(settings).not.toHaveProperty('currentLevel');
    expect(settings).not.toHaveProperty('completedLevels');
  });

  it('stores API key and persists to codino_settings only', () => {
    useGameStore.getState().setApiKey('test-key');
    expect(useGameStore.getState().apiKey).toBe('test-key');

    const settings = JSON.parse(localStorage.getItem('codino_settings')!);
    expect(settings.apiKey).toBe('test-key');
    expect(settings).not.toHaveProperty('currentLevel');
  });

  it('completes level and persists stars', () => {
    useGameStore.getState().completeLevel(1, 3);
    const state = useGameStore.getState();
    expect(state.completedLevels).toContain(1);
    expect(state.stars[1]).toBe(3);

    const progress = JSON.parse(localStorage.getItem('codino_progress')!);
    expect(progress.completedLevels).toContain(1);
    expect(progress.stars['1']).toBe(3);
  });

  it('selectElement advances currentLevel and resets currentProblem and currentCode', () => {
    useGameStore.getState().setProblem(PROBLEM);
    useGameStore.getState().setCode('SCRIVI 1');

    useGameStore.getState().selectElement(ELEMENT);

    const state = useGameStore.getState();
    expect(state.currentLevel).toBe(2);
    expect(state.chosenElements).toEqual([ELEMENT]);
    expect(state.currentProblem).toBeNull();
    expect(state.currentCode).toBe('');
  });

  it('codino_progress never contains currentProblem or currentCode', () => {
    useGameStore.getState().setStory('A story');
    useGameStore.getState().setProblem(PROBLEM);
    useGameStore.getState().setCode('SCRIVI 5');

    const progress = JSON.parse(localStorage.getItem('codino_progress')!);
    expect(progress).not.toHaveProperty('currentProblem');
    expect(progress).not.toHaveProperty('currentCode');
  });

  // ─── current level persistence ──────────────────────────────────────────────

  it('setProblem immediately saves problem+code to codino_current_level', () => {
    useGameStore.getState().setProblem(PROBLEM);

    const stored = JSON.parse(localStorage.getItem('codino_current_level')!);
    expect(stored.problem).toEqual(PROBLEM);
    expect(stored.code).toBe('');
  });

  it('setCode saves updated code to codino_current_level after 2-second debounce', () => {
    vi.useFakeTimers();
    useGameStore.getState().setProblem(PROBLEM);

    useGameStore.getState().setCode('mele = 5\nSCRIVI mele');

    // Not yet saved
    const before = JSON.parse(localStorage.getItem('codino_current_level')!);
    expect(before.code).toBe('');

    vi.advanceTimersByTime(2000);

    const after = JSON.parse(localStorage.getItem('codino_current_level')!);
    expect(after.code).toBe('mele = 5\nSCRIVI mele');
    expect(after.problem).toEqual(PROBLEM);
  });

  it('setCode debounce resets on each keystroke — only last value is saved', () => {
    vi.useFakeTimers();
    useGameStore.getState().setProblem(PROBLEM);

    useGameStore.getState().setCode('m');
    vi.advanceTimersByTime(500);
    useGameStore.getState().setCode('me');
    vi.advanceTimersByTime(500);
    useGameStore.getState().setCode('mele = 5');
    vi.advanceTimersByTime(2000);

    const stored = JSON.parse(localStorage.getItem('codino_current_level')!);
    expect(stored.code).toBe('mele = 5');
  });

  it('completeLevel clears codino_current_level and cancels pending save', () => {
    vi.useFakeTimers();
    useGameStore.getState().setProblem(PROBLEM);
    useGameStore.getState().setCode('SCRIVI 42');

    useGameStore.getState().completeLevel(1, 3);

    // Key must be gone immediately, before debounce fires
    expect(localStorage.getItem('codino_current_level')).toBeNull();

    // Advancing timer must NOT recreate the key
    vi.advanceTimersByTime(2000);
    expect(localStorage.getItem('codino_current_level')).toBeNull();
  });

  it('selectElement clears codino_current_level and cancels pending save', () => {
    vi.useFakeTimers();
    useGameStore.getState().setProblem(PROBLEM);
    useGameStore.getState().setCode('SCRIVI 1');

    useGameStore.getState().selectElement(ELEMENT);

    expect(localStorage.getItem('codino_current_level')).toBeNull();

    vi.advanceTimersByTime(2000);
    expect(localStorage.getItem('codino_current_level')).toBeNull();
  });

  it('resetProgress clears codino_current_level and cancels pending save', () => {
    vi.useFakeTimers();
    useGameStore.getState().setProblem(PROBLEM);
    useGameStore.getState().setCode('SCRIVI 99');

    useGameStore.getState().resetProgress();

    expect(localStorage.getItem('codino_current_level')).toBeNull();

    vi.advanceTimersByTime(2000);
    expect(localStorage.getItem('codino_current_level')).toBeNull();
  });

  it('resetProgress preserves language and apiKey', () => {
    useGameStore.getState().setLanguage('it');
    useGameStore.getState().setApiKey('my-key');
    useGameStore.getState().completeLevel(1, 2);

    useGameStore.getState().resetProgress();

    const state = useGameStore.getState();
    expect(state.language).toBe('it');
    expect(state.apiKey).toBe('my-key');
    expect(state.completedLevels).toEqual([]);
  });

  // ─── invariant relationships (game-state INV-01, INV-11) ────────────────────

  it('maintains INV-11 (chosenElements.length === currentLevel - 1) and INV-01 (chosenElements lags completedLevels by 0 or 1) across a full level cycle', () => {
    const store = useGameStore.getState;
    const inv01OK = () => {
      const diff = store().completedLevels.length - store().chosenElements.length;
      expect(diff === 0 || diff === 1).toBe(true);
    };

    // Initial state: level 1 in progress, nothing completed, no elements picked.
    expect(store().chosenElements.length).toBe(0);
    expect(store().completedLevels.length).toBe(0);
    expect(store().currentLevel).toBe(1);
    expect(store().chosenElements.length).toBe(store().currentLevel - 1);
    inv01OK();

    // Complete level 1 — completedLevels grows, others unchanged.
    // INV-11 holds (cE=0, curL-1=0). INV-01 is now in the lag state (diff=1).
    useGameStore.getState().completeLevel(1, 3);
    expect(store().chosenElements.length).toBe(0);
    expect(store().completedLevels.length).toBe(1);
    expect(store().currentLevel).toBe(1);
    expect(store().chosenElements.length).toBe(store().currentLevel - 1);
    inv01OK();

    // Player picks a branch element — currentLevel and chosenElements advance together.
    // Now cE=1, cL=1, curL=2. INV-11 holds; INV-01 back to equal.
    useGameStore.getState().selectElement(ELEMENT);
    expect(store().chosenElements.length).toBe(1);
    expect(store().completedLevels.length).toBe(1);
    expect(store().currentLevel).toBe(2);
    expect(store().chosenElements.length).toBe(store().currentLevel - 1);
    expect(store().chosenElements.length).toBe(store().completedLevels.length);
    inv01OK();

    // One more full cycle.
    useGameStore.getState().completeLevel(2, 2);
    inv01OK();
    useGameStore.getState().selectElement({ emoji: '🐉', name: 'dragon' });
    expect(store().currentLevel).toBe(3);
    expect(store().chosenElements.length).toBe(2);
    expect(store().completedLevels.length).toBe(2);
    expect(store().chosenElements.length).toBe(store().currentLevel - 1);
    inv01OK();
  });

  // ─── safe-defaults on corrupted localStorage (game-state INV-06) ────────────

  it('loadSettings returns safe defaults when codino_settings is malformed JSON', () => {
    localStorage.setItem('codino_settings', '{not valid json');
    expect(() => loadSettings()).not.toThrow();
    expect(loadSettings()).toEqual({ language: 'en', apiKey: null });
  });

  it('loadProgress returns an empty object when codino_progress is malformed JSON', () => {
    localStorage.setItem('codino_progress', '{not valid json');
    expect(() => loadProgress()).not.toThrow();
    expect(loadProgress()).toEqual({});
  });

  it('loadSettings returns defaults when codino_settings is missing', () => {
    localStorage.removeItem('codino_settings');
    expect(loadSettings()).toEqual({ language: 'en', apiKey: null });
  });

  it('loadProgress returns an empty object when codino_progress is missing', () => {
    localStorage.removeItem('codino_progress');
    expect(loadProgress()).toEqual({});
  });
});
