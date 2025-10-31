import { test, expect } from '@playwright/test';

test.describe('Catalog flow', () => {
  test('create and delete product', async ({ page }) => {
    const unique = `TestProd_${Date.now()}`;
    await page.goto('/');

    // Create product
    await page.getByLabel('SKU').fill(`SKU_${unique}`);
    await page.getByLabel('Name', { exact: true }).fill(unique);
    await page.getByLabel('Price (cents)').fill('12345');
    await page.getByLabel('Currency').fill('USD');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText('Created')).toBeVisible();
    await expect(page.getByText(unique)).toBeVisible();

    // Delete the newly created (first occurrence of its row)
    const row = page.getByText(unique).first().locator('..').locator('..');
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await expect(page.getByText('Deleted')).toBeVisible();
    await expect(page.getByText(unique)).toHaveCount(0);
  });
});


