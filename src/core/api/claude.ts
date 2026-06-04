import Anthropic from '@anthropic-ai/sdk';
import { validateStoryInput, validateCodeInput } from './validation';
import { buildMapGenerationPrompt, buildProblemGenerationPrompt, buildStarRatingPrompt } from './prompts';
import type {
  MapGenerationRequest,
  MapGenerationResponse,
  ProblemGenerationRequest,
  ProblemGenerationResponse,
  StarRatingRequest,
  StarRatingResponse
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

export class ClaudeAPIClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateMap(request: MapGenerationRequest): Promise<MapGenerationResponse> {
    const validatedStory = validateStoryInput(request.story);
    const prompt = buildMapGenerationPrompt(validatedStory, request.language);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return { mapStructure: data.levels };
  }

  async generateProblem(request: ProblemGenerationRequest): Promise<ProblemGenerationResponse> {
    const validatedStory = validateStoryInput(request.story);
    const concept = LEVEL_CONCEPTS[request.level - 1] || 'Basic concepts';
    const prompt = buildProblemGenerationPrompt(
      validatedStory,
      request.chosenElements,
      request.level,
      concept,
      request.language
    );

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      narrative: data.narrative,
      expectedOutput: data.expectedOutput,
    };
  }

  async rateCode(request: StarRatingRequest): Promise<StarRatingResponse> {
    const validatedCode = validateCodeInput(request.code);
    const prompt = buildStarRatingPrompt(request.problem, validatedCode, request.language);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      stars: Math.max(1, Math.min(3, data.stars)),
      explanation: data.explanation,
    };
  }
}
