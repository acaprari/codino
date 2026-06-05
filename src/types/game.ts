export interface Element {
  emoji: string;
  name: string;
}

export interface LevelStructure {
  level: number;
  branches: Element[];
}

export interface MapNode {
  id: number;
  level: number;
  branches: Branch[];
  completed: boolean;
  chosenElement?: Element;
}

export interface Branch {
  targetNodeId: number;
  element: Element;
}

export interface Problem {
  narrative: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  stars?: number;
  explanation?: string;
}
