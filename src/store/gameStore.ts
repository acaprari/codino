import { create } from 'zustand';
import {
  loadSettings,
  saveSettings,
  loadProgress,
  saveProgress,
  clearProgress,
  loadCurrentLevel,
  saveCurrentLevel,
  clearCurrentLevel,
  type Progress,
} from './persistence';
import type { Element, LevelStructure, Problem } from '../types/game';

interface GameState {
  // Settings
  language: 'it' | 'en';
  apiKey: string | null;

  // Progress
  initialStory: string;
  currentLevel: number;
  completedLevels: number[];
  mapStructure: LevelStructure[];
  chosenElements: Element[];
  stars: Record<number, number>;

  // Current level (persisted under codino_current_level, not codino_progress)
  currentProblem: Problem | null;
  currentCode: string;

  // Actions
  setLanguage: (lang: 'it' | 'en') => void;
  setApiKey: (key: string) => void;
  setStory: (story: string) => void;
  setMapStructure: (map: LevelStructure[]) => void;
  selectElement: (element: Element) => void;
  setProblem: (problem: Problem) => void;
  setCode: (code: string) => void;
  completeLevel: (level: number, stars: number) => void;
  resetProgress: () => void;
}

function toProgress(s: GameState): Progress {
  return {
    initialStory: s.initialStory,
    currentLevel: s.currentLevel,
    completedLevels: s.completedLevels,
    mapStructure: s.mapStructure,
    chosenElements: s.chosenElements,
    stars: s.stars,
  };
}

// Module-level debounce timer — lives outside the store to survive re-renders.
let codeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function cancelCodeDebounce(): void {
  if (codeDebounceTimer !== null) {
    clearTimeout(codeDebounceTimer);
    codeDebounceTimer = null;
  }
}

export const useGameStore = create<GameState>((set, get) => {
  const settings = loadSettings();
  const progress = loadProgress();
  const currentLevel = loadCurrentLevel();

  return {
    language: settings.language,
    apiKey: settings.apiKey,
    initialStory: progress.initialStory ?? '',
    currentLevel: progress.currentLevel ?? 0,
    completedLevels: progress.completedLevels ?? [],
    mapStructure: progress.mapStructure ?? [],
    chosenElements: progress.chosenElements ?? [],
    stars: progress.stars ?? {},
    currentProblem: currentLevel?.problem ?? null,
    currentCode: currentLevel?.code ?? '',

    setLanguage: (lang) => {
      set({ language: lang });
      saveSettings({ language: lang, apiKey: get().apiKey });
    },

    setApiKey: (key) => {
      set({ apiKey: key });
      saveSettings({ language: get().language, apiKey: key });
    },

    setStory: (story) => {
      set({ initialStory: story });
      saveProgress(toProgress(get()));
    },

    setMapStructure: (map) => {
      set({ mapStructure: map });
      saveProgress(toProgress(get()));
    },

    selectElement: (element) => {
      cancelCodeDebounce();
      clearCurrentLevel();
      const state = get();
      set({
        chosenElements: [...state.chosenElements, element],
        currentLevel: state.currentLevel + 1,
        currentProblem: null,
        currentCode: '',
      });
      saveProgress(toProgress(get()));
    },

    setProblem: (problem) => {
      set({ currentProblem: problem });
      saveCurrentLevel({ problem, code: get().currentCode });
    },

    setCode: (code) => {
      set({ currentCode: code });
      cancelCodeDebounce();
      codeDebounceTimer = setTimeout(() => {
        codeDebounceTimer = null;
        const { currentProblem } = get();
        if (currentProblem) {
          saveCurrentLevel({ problem: currentProblem, code });
        }
      }, 2000);
    },

    completeLevel: (level, stars) => {
      cancelCodeDebounce();
      clearCurrentLevel();
      const state = get();
      set({
        completedLevels: [...state.completedLevels, level],
        stars: { ...state.stars, [level]: stars },
      });
      saveProgress(toProgress(get()));
    },

    resetProgress: () => {
      cancelCodeDebounce();
      clearProgress();
      clearCurrentLevel();
      set({
        initialStory: '',
        currentLevel: 0,
        completedLevels: [],
        mapStructure: [],
        chosenElements: [],
        stars: {},
        currentProblem: null,
        currentCode: '',
      });
    },
  };
});
