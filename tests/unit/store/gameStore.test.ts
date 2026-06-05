import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../../../src/store/gameStore';

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
    expect(state.currentLevel).toBe(0);
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
    expect(state.currentLevel).toBe(1);
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
});
