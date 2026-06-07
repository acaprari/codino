import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('codino_progress', JSON.stringify({
        initialStory: 'A brave knight',
        currentLevel: 0,
        completedLevels: [],
        mapStructure: [],
        chosenElements: [],
        stars: {},
      }));
    });
    await page.reload();
    await page.getByRole('button', { name: /impostazioni|settings/i }).click();
  });

  test('shows API Key heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).toBeVisible();
  });

  test('shows both language options', async ({ page }) => {
    await expect(page.getByText(/Italiano|Italian/)).toBeVisible();
    await expect(page.getByText(/English|Inglese/)).toBeVisible();
  });
});
