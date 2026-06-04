const SETTINGS_KEY = 'codino_settings';
const PROGRESS_KEY = 'codino_progress';

export interface Settings {
  language: 'it' | 'en';
  apiKey: string | null;
}

export interface Progress {
  initialStory: string;
  currentLevel: number;
  completedLevels: number[];
  mapStructure: any[];
  chosenElements: any[];
  stars: Record<number, number>;
}

export function loadSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    return { language: 'en', apiKey: null };
  }
  return JSON.parse(stored);
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadProgress(): Partial<Progress> {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) {
    return {};
  }
  return JSON.parse(stored);
}

export function saveProgress(progress: Partial<Progress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}
