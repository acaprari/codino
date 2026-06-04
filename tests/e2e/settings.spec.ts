import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
  });

  test('should display settings screen', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Settings|Impostazioni/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /API Key/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Language|Lingua/i })).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    // Check both IT and EN language buttons exist
    await expect(page.getByText('Italiano')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
  });

  test('should show API key input', async ({ page }) => {
    // Check for password input (API key field)
    const apiKeyInput = page.locator('input[type="password"]');
    await expect(apiKeyInput).toBeVisible();
  });

  test('should close settings', async ({ page }) => {
    // Click close button (X symbol)
    await page.getByRole('button', { name: '✕' }).click();

    // Should return to welcome/previous screen
    await expect(page.getByRole('heading', { name: /Welcome to Codino|Benvenuto in Codino/i })).toBeVisible();
  });
});
