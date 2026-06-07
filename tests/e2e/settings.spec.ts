import { test, expect } from '@playwright/test';

const seedProgress = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
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
};

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await seedProgress(page);
    // Target the TopBar settings button specifically by aria-label
    await page.getByRole('button', { name: /^(Impostazioni|Settings)$/ }).first().click();
  });

  test('shows API Key heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).toBeVisible();
  });

  test('shows both language options', async ({ page }) => {
    await expect(page.getByText(/Italiano|Italian/).first()).toBeVisible();
    await expect(page.getByText(/English|Inglese/).first()).toBeVisible();
  });
});
