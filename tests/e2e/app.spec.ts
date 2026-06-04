import { test, expect } from '@playwright/test';

test('homepage loads welcome screen', async ({ page }) => {
  await page.goto('/');

  // Check for welcome screen heading
  await expect(page.getByRole('heading', { name: /Welcome to Codino/i })).toBeVisible();

  // Check for start button
  await expect(page.getByRole('button', { name: /Start Your Adventure/i })).toBeVisible();
});
