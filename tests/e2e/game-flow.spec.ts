import { test, expect } from '@playwright/test';

test.describe('Codino Game Flow', () => {
  test('should complete full game flow from welcome to success', async ({ page }) => {
    // Start at welcome screen
    await page.goto('/');
    
    // Check welcome screen loaded
    await expect(page.getByText(/Welcome to Codino|Benvenuto in Codino/)).toBeVisible();
    
    // Click start button
    await page.getByRole('button', { name: /Start|Inizia/ }).click();
    
    // Should now be on story input screen
    await expect(page.getByText(/Tell Your Story|Racconta/i)).toBeVisible();
    
    // Enter a story
    const textarea = page.getByRole('textbox');
    await textarea.fill('A brave knight searching for treasure in a castle');
    
    // Submit story (this would trigger AI in real app, but we're testing flow)
    await page.getByRole('button', { name: /Start Adventure|Inizia/i }).click();
    
    // Should navigate to map (in real app, after API call)
    // Note: In actual implementation, this might show loading state first
    await expect(page.getByText(/Level|Livello/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to settings from navbar', async ({ page }) => {
    await page.goto('/');

    // Click settings icon in navbar
    await page.getByRole('button', { name: '⚙️' }).click();

    // Should show settings screen - check for heading
    await expect(page.getByRole('heading', { name: /API Key/i })).toBeVisible();
  });
});
