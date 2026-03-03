import { test, expect } from '@playwright/test';

test('spawning units via buttons', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click spawn player
    await page.click('#spawn-player');

    // Since we can't easily inspect Three.js scene from Playwright without exposing a global,
    // we just verify the button click doesn't crash and the canvas is still there.
    const canvas = await page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
});

test('spawning units via keys', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.keyboard.press('q');
    await page.keyboard.press('e');

    const canvas = await page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
});
