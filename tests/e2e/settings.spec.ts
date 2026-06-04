import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings
    await page.getByRole('button', { name: '⚙️' }).click();
  });

  test('should display settings screen', async ({ page }) => {
    await expect(page.getByText(/Settings|Impostazioni/i)).toBeVisible();
    await expect(page.getByText(/API Key/i)).toBeVisible();
    await expect(page.getByText(/Language|Lingua/i)).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    // Find language buttons
    const languageSection = page.locator('text=/Language|Lingua/i').locator('..');
    
    // Check both IT and EN options exist
    await expect(languageSection.getByText('🇮🇹 IT')).toBeVisible();
    await expect(languageSection.getByText('🇬🇧 EN')).toBeVisible();
  });

  test('should show API key input', async ({ page }) => {
    // Check for password input (API key field)
    const apiKeyInput = page.locator('input[type="password"]');
    await expect(apiKeyInput).toBeVisible();
  });

  test('should close settings', async ({ page }) => {
    // Click close button
    await page.getByRole('button', { name: /Close|Chiudi/i }).click();
    
    // Should return to welcome/previous screen
    await expect(page.getByText(/Welcome|Benvenuto/i)).toBeVisible();
  });
});
