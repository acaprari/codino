import { Page } from '@playwright/test';

/**
 * Mock API responses for E2E tests
 * Intercepts network requests to Claude API and returns mock data
 */

export interface MockMapResponse {
  levels: Array<{
    level: number;
    emoji: string;
    concept: string;
    unlocked: boolean;
  }>;
}

export interface MockProblemResponse {
  narrative: string;
  expectedOutput: string;
}

export interface MockRatingResponse {
  stars: number;
  explanation: string;
}

/**
 * Setup mock API responses for a Playwright page
 * This intercepts fetch requests to the Anthropic API and returns mock data
 */
export async function setupMockAPI(page: Page) {
  // Mock the Anthropic API endpoint
  await page.route('https://api.anthropic.com/v1/messages', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    // Determine which endpoint is being called based on prompt content
    const prompt = postData?.messages?.[0]?.content || '';

    let mockResponse;

    if (prompt.includes('map') || prompt.includes('levels') || prompt.includes('story structure')) {
      // Map generation request
      mockResponse = {
        id: 'msg_mock_map',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            levels: [
              { level: 1, emoji: '🌟', concept: 'Print & Variables', unlocked: true },
              { level: 2, emoji: '🔢', concept: 'Basic Math', unlocked: false },
              { level: 3, emoji: '🔄', concept: 'Simple Loops', unlocked: false },
              { level: 4, emoji: '❓', concept: 'Conditions', unlocked: false },
              { level: 5, emoji: '🎯', concept: 'All Concepts', unlocked: false },
            ]
          })
        }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 200 }
      };
    } else if (prompt.includes('problem') || prompt.includes('coding challenge')) {
      // Problem generation request
      mockResponse = {
        id: 'msg_mock_problem',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            narrative: 'Your adventure begins! Print "Hello World" to start your journey.',
            expectedOutput: 'Hello World'
          })
        }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 150 }
      };
    } else if (prompt.includes('rating') || prompt.includes('stars') || prompt.includes('evaluate')) {
      // Code rating request
      mockResponse = {
        id: 'msg_mock_rating',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: JSON.stringify({
            stars: 3,
            explanation: 'Great work! Your code is clean and correct.'
          })
        }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 100 }
      };
    } else {
      // Default response
      mockResponse = {
        id: 'msg_mock_default',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'Mock response'
        }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: { input_tokens: 50, output_tokens: 50 }
      };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse)
    });
  });
}

/**
 * Setup mock API to return an error response
 */
export async function setupMockAPIError(page: Page, errorMessage: string = 'API Error') {
  await page.route('https://api.anthropic.com/v1/messages', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          type: 'api_error',
          message: errorMessage
        }
      })
    });
  });
}

/**
 * Setup localStorage with a test API key
 */
export async function setMockAPIKey(page: Page, apiKey: string = 'test-api-key-123') {
  await page.addInitScript((key) => {
    const mockState = {
      state: {
        apiKey: key,
        language: 'en',
        initialStory: '',
        mapStructure: [],
        currentLevel: 0,
        chosenElements: [],
        currentProblem: null,
        completedLevels: {}
      },
      version: 0
    };
    localStorage.setItem('codino-game-store', JSON.stringify(mockState));
  }, apiKey);
}

/**
 * Clear all localStorage data
 */
export async function clearMockStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}
