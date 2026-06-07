import { test, expect } from '@playwright/test';

test.describe('Codino Game Flow', () => {
  test('shows the welcome modal on first load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/i)).toBeVisible();
  });

  test('opens settings from the top bar when workspace is active', async ({ page }) => {
    await page.goto('/');
    // Seed progress so the welcome modal is bypassed on reload
    await page.evaluate(() => {
      localStorage.setItem('codino_progress', JSON.stringify({
        initialStory: 'A brave knight',
        currentLevel: 1,
        completedLevels: [],
        mapStructure: [],
        mapStartEmoji: '🏰',
        chosenElements: [],
        stars: {},
      }));
    });
    await page.reload();
    // Only the TopBar settings button is visible (welcome modal is gone)
    await page.getByRole('button', { name: /^(Impostazioni|Settings)$/ }).click();
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).toBeVisible();
  });
});
