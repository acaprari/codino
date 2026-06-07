import { test, expect } from '@playwright/test';

test('homepage shows the welcome modal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/i)).toBeVisible();
});
