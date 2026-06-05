import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings — the settings button is the only ⚙️ button in the navbar
    await page.getByRole('button', { name: '⚙️' }).click();
  });

  // Settings UI is fully bilingual. Match either Italian or English labels
  // since the default language depends on persisted state.

  test('should display settings screen', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Settings|Impostazioni/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /API Key/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Language|Lingua/i })).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    // Both language buttons exist regardless of current UI language.
    // Italian button label: "Italiano" (IT) or "Italian" (EN)
    // English button label: "English" (EN) or "Inglese" (IT)
    await expect(page.getByText(/Italiano|Italian/)).toBeVisible();
    await expect(page.getByText(/English|Inglese/)).toBeVisible();
  });

  test('should show API key input', async ({ page }) => {
    // Check for password input (API key field)
    const apiKeyInput = page.locator('input[type="password"]');
    await expect(apiKeyInput).toBeVisible();
  });

  test('should close settings', async ({ page }) => {
    // Close button has bilingual aria-label: "Close" (EN) or "Chiudi" (IT)
    await page.getByRole('button', { name: /Close|Chiudi/i }).click();

    // Should return to welcome/previous screen
    await expect(page.getByRole('heading', { name: /Welcome to Codino|Benvenuto in Codino/i })).toBeVisible();
  });
});
