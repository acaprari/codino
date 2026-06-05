import Anthropic from '@anthropic-ai/sdk';
import { validateStoryInput, validateCodeInput } from './validation';
import {
  buildMapGenerationPrompt,
  buildProblemGenerationPrompt,
  buildStarRatingPrompt,
  buildHintPrompt,
  buildErrorAnalysisPrompt,
  buildStoryIdeasPrompt,
} from './prompts';
import type {
  MapGenerationRequest,
  MapGenerationResponse,
  ProblemGenerationRequest,
  ProblemGenerationResponse,
  StarRatingRequest,
  StarRatingResponse,
  HintRequest,
  HintResponse,
  ErrorAnalysisRequest,
  ErrorAnalysisResponse,
  StoryIdeasRequest,
  StoryIdeasResponse,
} from './types';

const LEVEL_CONCEPTS = [
  'Print & Variables',
  'Basic Math (+, -)',
  'Basic Math (x, :)',
  'Simple Loops',
  'Simple Loops (practice)',
  'Conditions (IF)',
  'Conditions (IF/ELSE)',
  'Loops + Conditions',
  'Loops + Conditions (practice)',
  'All Concepts Combined',
];

const MODEL_SONNET = 'claude-sonnet-4-6';
const MODEL_HAIKU = 'claude-haiku-4-5-20251001';

export class ClaudeAPIClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async testConnection(): Promise<void> {
    await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    });
  }

  async generateMap(request: MapGenerationRequest): Promise<MapGenerationResponse> {
    const validatedStory = validateStoryInput(request.story);
    const { system, user } = buildMapGenerationPrompt(validatedStory, request.language);

    const response = await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return { mapStructure: data.levels as MapGenerationResponse['mapStructure'] };
  }

  async generateProblem(request: ProblemGenerationRequest): Promise<ProblemGenerationResponse> {
    const validatedStory = validateStoryInput(request.story);
    const concept = LEVEL_CONCEPTS[request.level - 1] ?? 'Basic concepts';
    const { system, user } = buildProblemGenerationPrompt(
      validatedStory,
      request.chosenElements,
      request.level,
      concept,
      request.language
    );

    const response = await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return {
      narrative: data.narrative as string,
      expectedOutput: data.expectedOutput as string,
    };
  }

  async rateCode(request: StarRatingRequest): Promise<StarRatingResponse> {
    const validatedStory = validateStoryInput(request.story);
    const validatedCode = validateCodeInput(request.code);
    const { system, user } = buildStarRatingPrompt(
      validatedStory,
      request.problem,
      validatedCode,
      request.level,
      request.chosenElement,
      request.language
    );

    const response = await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return {
      stars: Math.max(1, Math.min(3, data.stars as number)),
      explanation: data.explanation as string,
      narrativeBridge: data.narrativeBridge as string,
    };
  }

  async generateHint(request: HintRequest): Promise<HintResponse> {
    const validatedCode = validateCodeInput(request.code);
    const { system, user } = buildHintPrompt(request.problem, validatedCode, request.language);

    const response = await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return { hint: data.hint as string };
  }

  async generateStoryIdeas(request: StoryIdeasRequest): Promise<StoryIdeasResponse> {
    const { system, user } = buildStoryIdeasPrompt(request.language);

    const response = await this.client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return { ideas: data.ideas as string[] };
  }

  async analyzeError(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    const validatedCode = validateCodeInput(request.code);
    const { system, user } = buildErrorAnalysisPrompt(
      request.problem,
      validatedCode,
      request.expectedOutput,
      request.actualOutput,
      request.language
    );

    const response = await this.client.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const data = parseJSONResponse(response);
    return { explanation: data.explanation as string };
  }
}

function parseJSONResponse(response: Anthropic.Message): Record<string, unknown> {
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }
  // Normalize a known wrapper format: ```json\n{...}\n``` or ```\n{...}\n```.
  // This is not regex extraction from prose — it strips a known markdown
  // fence format that some models emit despite "JSON only" instructions.
  let text = content.text.trim();
  if (text.startsWith('```')) {
    text = text
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?\s*```\s*$/, '')
      .trim();
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON in AI response');
  }
}
