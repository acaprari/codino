import { test, expect } from '@playwright/test';

test.describe('Codino Game Flow', () => {
  test('should show the welcome modal on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/i)).toBeVisible();
  });

  test('should navigate to settings from the top bar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /impostazioni|settings/i }).click();
    await expect(page.getByRole('heading', { name: /API Key|Chiave API/i })).toBeVisible();
  });
});
