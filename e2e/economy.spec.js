import { test, expect } from '@playwright/test';

test('flux increases over time', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const initialFlux = await page.locator('#flux-value').textContent();
    await page.waitForTimeout(2000);
    const laterFlux = await page.locator('#flux-value').textContent();

    expect(Number(laterFlux)).toBeGreaterThan(Number(initialFlux));
});

test('building extractor', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for flux to accumulate if needed (though we start with 100 and it costs 50)
    const initialIncome = await page.locator('#flux-rate').textContent();

    // Wait for the button and make sure it's stable
    const buildBtn = page.locator('button:has-text("Build Extractor (Zone 0)")');
    await buildBtn.waitFor({ state: 'visible' });

    await buildBtn.click();

    await expect(page.locator('#flux-rate')).not.toHaveText(initialIncome);
});
