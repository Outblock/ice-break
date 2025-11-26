import { test, expect } from '@playwright/test';

test('take screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page).toHaveTitle(/8-BIT SLOT MACHINE/);
  await page.screenshot({ path: 'screenshot.png' });
});
