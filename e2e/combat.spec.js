import { test, expect } from '@playwright/test';

test('combat engagement and hit markers', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Spawn units
    await page.keyboard.press('q');
    await page.keyboard.press('e');

    // Wait for a hit marker to appear in the DOM
    await page.waitForSelector('.hit-marker', { timeout: 30000 });

    const marker = page.locator('.hit-marker').first();
    await expect(marker).toBeAttached();
});
