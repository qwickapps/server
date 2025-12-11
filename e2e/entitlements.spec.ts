import { test, expect } from '@playwright/test';

/**
 * Entitlements Page tests for the Control Panel UI
 *
 * The control panel is mounted at /cpanel in the gateway architecture.
 */
test.describe('Entitlements Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cpanel/entitlements');
  });

  test('should display page header', async ({ page }) => {
    // The page uses Text component with variant="h4", which renders as paragraph
    await expect(page.getByText('Entitlements').first()).toBeVisible();
    await expect(page.getByText('Manage available entitlements')).toBeVisible();
  });

  test('should display Add Entitlement button (writable source)', async ({ page }) => {
    // Demo server uses writable in-memory source
    const addButton = page.getByRole('button', { name: /Add Entitlement/i });
    await expect(addButton).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Total entitlements count
    await expect(page.getByText('Total Entitlements')).toBeVisible();

    // Categories count
    await expect(page.getByText('Categories')).toBeVisible();

    // Source status (should show Editable for writable source)
    await expect(page.getByText('Editable')).toBeVisible();
    await expect(page.getByText('Source: in-memory')).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search entitlements/i)).toBeVisible();
  });

  test('should display entitlements table with correct headers', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should display demo entitlements', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for demo entitlements from in-memory source
    // Use exact match for name cells (first column)
    await expect(page.getByRole('cell', { name: 'premium', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'pro', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'enterprise', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'beta-access', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'api-access', exact: true })).toBeVisible();
  });

  test('should display category chips', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Categories from demo data - use locator within table
    const table = page.locator('table');
    await expect(table.getByText('subscription').first()).toBeVisible();
    await expect(table.getByText('features').first()).toBeVisible();
  });

  test('should filter entitlements by search', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Search entitlements/i);
    await searchInput.fill('premium');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Should show premium (use exact match for name cell)
    await expect(page.getByRole('cell', { name: 'premium', exact: true })).toBeVisible();

    // Should not show pro (filtered out)
    await expect(page.getByRole('cell', { name: 'pro', exact: true })).not.toBeVisible();
  });

  test('should open Add Entitlement dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entitlement/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Entitlement' })).toBeVisible();
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Category/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
  });

  test('should close Add Entitlement dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Add Entitlement/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display source info section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Entitlement Sources')).toBeVisible();
    await expect(page.getByText('Primary')).toBeVisible();
    // Use exact match for "in-memory"
    await expect(page.getByText('in-memory', { exact: true })).toBeVisible();
  });

  test('should have edit and delete buttons for entitlements', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find the first row's action buttons
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow.getByRole('button', { name: /Edit/i })).toBeVisible();
    await expect(firstRow.getByRole('button', { name: /Delete/i })).toBeVisible();
  });
});
