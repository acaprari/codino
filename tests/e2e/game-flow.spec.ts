import { test, expect } from '@playwright/test';

const PROGRESS = JSON.stringify({
  initialStory: 'A brave knight',
  currentLevel: 1,
  completedLevels: [],
  mapStructure: [],
  mapStartEmoji: '🏰',
  chosenElements: [],
  stars: {},
});

test.describe('Codino Game Flow', () => {
  test('shows the welcome modal on first load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/i)).toBeVisible();
  });

  test('opens settings from the top bar when workspace is active', async ({ page }) => {
    await page.addInitScript((progress) => {
      localStorage.setItem('codino_progress', progress);
    }, PROGRESS);
    await page.goto('/');
    await page.getByRole('button', { name: /^(Impostazioni|Settings)$/i }).click();
    await expect(page.getByRole('heading', { name: /^(Impostazioni|Settings)$/i })).toBeVisible();
  });
});
