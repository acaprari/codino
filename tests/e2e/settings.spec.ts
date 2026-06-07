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

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Seed localStorage before React initialises so the welcome modal is bypassed
    await page.addInitScript((progress) => {
      localStorage.setItem('codino_progress', progress);
    }, PROGRESS);
    await page.goto('/');
    // Only the TopBar settings button exists (welcome modal is closed)
    await page.getByRole('button', { name: /^(Impostazioni|Settings)$/i }).click();
  });

  test('opens the settings modal', async ({ page }) => {
    // The modal title is the h2 "Impostazioni" / "Settings"
    await expect(page.getByRole('heading', { name: /^(Impostazioni|Settings)$/i })).toBeVisible();
  });

  test('shows the API key section', async ({ page }) => {
    // API key section label is a div, not a heading — match by text content
    await expect(page.getByText(/Anthropic API Key|Chiave API/i).first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows both language options', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Italiano|Italian/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /English|Inglese/i }).first()).toBeVisible();
  });
});
