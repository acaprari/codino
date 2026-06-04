import { create } from 'zustand';
import { loadSettings, saveSettings, loadProgress, saveProgress, clearProgress } from './persistence';
import type { Element, MapNode, Problem } from '../types/game';

interface GameState {
  // Settings
  language: 'it' | 'en';
  apiKey: string | null;

  // Progress
  initialStory: string;
  currentLevel: number;
  completedLevels: number[];
  mapStructure: MapNode[];
  chosenElements: Element[];
  stars: Record<number, number>;

  // Current level
  currentProblem: Problem | null;
  currentCode: string;

  // Actions
  setLanguage: (lang: 'it' | 'en') => void;
  setApiKey: (key: string) => void;
  setStory: (story: string) => void;
  setMapStructure: (map: MapNode[]) => void;
  selectElement: (element: Element) => void;
  setProblem: (problem: Problem) => void;
  setCode: (code: string) => void;
  completeLevel: (level: number, stars: number) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
  const settings = loadSettings();
  const progress = loadProgress();

  return {
    // Initial state from localStorage
    language: settings.language,
    apiKey: settings.apiKey,
    initialStory: progress.initialStory || '',
    currentLevel: progress.currentLevel || 0,
    completedLevels: progress.completedLevels || [],
    mapStructure: progress.mapStructure || [],
    chosenElements: progress.chosenElements || [],
    stars: progress.stars || {},
    currentProblem: null,
    currentCode: '',

    // Actions
    setLanguage: (lang) => {
      set({ language: lang });
      saveSettings({ ...get(), language: lang });
    },

    setApiKey: (key) => {
      set({ apiKey: key });
      saveSettings({ ...get(), apiKey: key });
    },

    setStory: (story) => {
      set({ initialStory: story });
      saveProgress({ ...get(), initialStory: story });
    },

    setMapStructure: (map) => {
      set({ mapStructure: map });
      saveProgress({ ...get(), mapStructure: map });
    },

    selectElement: (element) => {
      const state = get();
      const newElements = [...state.chosenElements, element];
      set({
        chosenElements: newElements,
        currentLevel: state.currentLevel + 1,
      });
      saveProgress({
        ...state,
        chosenElements: newElements,
        currentLevel: state.currentLevel + 1,
      });
    },

    setProblem: (problem) => {
      set({ currentProblem: problem });
    },

    setCode: (code) => {
      set({ currentCode: code });
    },

    completeLevel: (level, stars) => {
      const state = get();
      const newCompleted = [...state.completedLevels, level];
      const newStars = { ...state.stars, [level]: stars };
      set({
        completedLevels: newCompleted,
        stars: newStars,
      });
      saveProgress({
        ...state,
        completedLevels: newCompleted,
        stars: newStars,
      });
    },

    resetProgress: () => {
      clearProgress();
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
