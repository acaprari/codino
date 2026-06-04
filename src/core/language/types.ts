/**
 * Represents a single step in program execution for animation purposes
 */
export interface ExecutionStep {
  /** Line number being executed (1-indexed) */
  line: number;
  /** Current state of all variables */
  variables: Record<string, number | string>;
  /** Output produced at this step (if any) */
  output?: string;
}

/**
 * Result of executing a Codino program
 */
export interface ExecutionResult {
  /** All execution steps for animation */
  steps: ExecutionStep[];
  /** Final output of the program */
  output: string[];
  /** Runtime error if execution failed */
  error?: RuntimeError;
}

/**
 * Runtime error during program execution
 */
export class RuntimeError extends Error {
  constructor(
    message: string,
    public line: number
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}
