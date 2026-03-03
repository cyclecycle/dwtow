import { test, expect } from '@playwright/test';

test('game canvas renders', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const canvas = await page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
});

test('page title is correct', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/Drone Wars TOW/);
});
