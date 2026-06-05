import type { LevelStructure, Element, Problem } from '../types/game';

const SETTINGS_KEY = 'codino_settings';
const PROGRESS_KEY = 'codino_progress';
const CURRENT_LEVEL_KEY = 'codino_current_level';

export interface Settings {
  language: 'it' | 'en';
  apiKey: string | null;
}

export interface Progress {
  initialStory: string;
  currentLevel: number;
  completedLevels: number[];
  mapStructure: LevelStructure[];
  chosenElements: Element[];
  stars: Record<number, number>;
}

export function loadSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return { language: 'en', apiKey: null };
  try {
    return JSON.parse(stored) as Settings;
  } catch {
    return { language: 'en', apiKey: null };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadProgress(): Partial<Progress> {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Partial<Progress>;
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}

export interface CurrentLevelState {
  problem: Problem;
  code: string;
}

export function loadCurrentLevel(): CurrentLevelState | null {
  const stored = localStorage.getItem(CURRENT_LEVEL_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CurrentLevelState;
  } catch {
    return null;
  }
}

export function saveCurrentLevel(state: CurrentLevelState): void {
  localStorage.setItem(CURRENT_LEVEL_KEY, JSON.stringify(state));
}

export function clearCurrentLevel(): void {
  localStorage.removeItem(CURRENT_LEVEL_KEY);
}
