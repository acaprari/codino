import { test, expect, type Page } from '@playwright/test';

const PROGRESS = JSON.stringify({
  initialStory: 'A brave knight',
  currentLevel: 1,
  completedLevels: [],
  mapStructure: [],
  mapStartEmoji: '🏰',
  chosenElements: [],
  stars: {},
});

// A minimal problem. expectedOutput is a sentinel that won't match any test
// program, so no modal fires before we can assert.  The actual output of each
// program is still captured in the ExecutionPanel and asserted there.
const CURRENT_LEVEL = JSON.stringify({
  problem: {
    narrative: 'Write a program.',
    expectedOutput: '__SENTINEL_NOMATCH__',
  },
  code: '',
});

/**
 * Each test types a small Codino program into the editor, presses Run,
 * and verifies the output rendered in the ExecutionPanel.
 *
 * These tests do not require an API key — they only exercise the
 * parser/interpreter/animation pipeline locally.
 */
test.describe('Codino language revision — happy paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ progress, currentLevel }) => {
      localStorage.setItem('codino_progress', progress);
      localStorage.setItem('codino_current_level', currentLevel);
    }, { progress: PROGRESS, currentLevel: CURRENT_LEVEL });
    await page.goto('/');
  });

  /** Returns the output content box inside the ExecutionPanel. */
  function outputBox(page: Page) {
    return page.locator('[data-testid="execution-output"]');
  }

  async function runAndAssertOutput(page: Page, code: string, expectedOutput: string) {
    // Click into CodeMirror editor, select all existing content, replace with test code
    await page.locator('.cm-content').click();
    await page.keyboard.press('Control+a');
    await page.keyboard.insertText(code);
    await page.getByRole('button', { name: /▶\s*(RUN|ESEGUI)/i }).click();
    await expect(outputBox(page)).toContainText(expectedOutput, { timeout: 15000 });
  }

  test('multi-arg WRITE prints a single joined line', async ({ page }) => {
    await runAndAssertOutput(
      page,
      'apples = 5\nWRITE "Apples:", apples',
      'Apples: 5',
    );
  });

  test('REPEAT with variable count loops that many times', async ({ page }) => {
    await runAndAssertOutput(
      page,
      'n = 3\nREPEAT n TIMES\nWRITE "go"\nEND',
      'go\ngo\ngo',
    );
  });

  test('range loop binds i and counts inclusively', async ({ page }) => {
    await runAndAssertOutput(
      page,
      'REPEAT i FROM 1 TO 3\nWRITE i\nEND',
      '1\n2\n3',
    );
  });

  test('IF EVEN takes the true branch on an even number', async ({ page }) => {
    await runAndAssertOutput(
      page,
      'n = 4\nIF n EVEN\nWRITE "yes"\nEND',
      'yes',
    );
  });

  test('IF ODD takes the false branch on an even number', async ({ page }) => {
    await runAndAssertOutput(
      page,
      'n = 4\nIF n ODD\nWRITE "yes"\nELSE\nWRITE "no"\nEND',
      'no',
    );
  });
});
