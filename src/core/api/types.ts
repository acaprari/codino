import type { Element, LevelStructure } from '../../types/game';

export type { Element, LevelStructure };

export interface PromptParts {
  system: string;
  user: string;
}

export interface MapGenerationRequest {
  story: string;
  language: 'it' | 'en';
}

export interface MapGenerationResponse {
  mapStructure: LevelStructure[];
  startEmoji: string;
}

export interface ProblemGenerationRequest {
  story: string;
  chosenElements: Element[];
  level: number;
  language: 'it' | 'en';
}

export interface ProblemGenerationResponse {
  narrative: string;
  expectedOutput: string;
}

export interface StarRatingRequest {
  story: string;
  problem: string;
  code: string;
  level: number;
  chosenElement: Element;
  language: 'it' | 'en';
}

export interface StarRatingResponse {
  stars: number;
  explanation: string;
  narrativeBridge: string;
}

export interface HintRequest {
  problem: string;
  code: string;
  language: 'it' | 'en';
}

export interface HintResponse {
  hint: string;
}

export interface ErrorAnalysisRequest {
  problem: string;
  code: string;
  expectedOutput: string;
  actualOutput: string;
  language: 'it' | 'en';
}

export interface ErrorAnalysisResponse {
  explanation: string;
}

export interface StoryIdeasRequest {
  language: 'it' | 'en';
}

export interface StoryIdeasResponse {
  ideas: string[];
}
