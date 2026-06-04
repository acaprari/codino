export interface MapGenerationRequest {
  story: string;
  language: 'it' | 'en';
}

export interface MapGenerationResponse {
  mapStructure: any[];
}

export interface ProblemGenerationRequest {
  story: string;
  chosenElements: any[];
  level: number;
  language: 'it' | 'en';
}

export interface ProblemGenerationResponse {
  narrative: string;
  expectedOutput: string;
}

export interface StarRatingRequest {
  problem: string;
  code: string;
  language: 'it' | 'en';
}

export interface StarRatingResponse {
  stars: number;
  explanation: string;
}
