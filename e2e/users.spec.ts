import { test, expect } from '@playwright/test';

/**
 * Users Page tests for the Control Panel UI
 *
 * The control panel is mounted at /cpanel in the gateway architecture.
 */
test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cpanel/users');
  });

  test('should display page header', async ({ page }) => {
    // Page title is rendered as paragraph via Text component, not heading
    await expect(page.getByText('User Management').first()).toBeVisible();
  });

  test('should display Lookup Entitlements button', async ({ page }) => {
    const lookupButton = page.getByRole('button', { name: /Lookup Entitlements/i });
    await expect(lookupButton).toBeVisible();
  });

  test('should display Ban User button', async ({ page }) => {
    const banButton = page.getByRole('button', { name: /Ban User/i });
    await expect(banButton).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Total users
    await expect(page.getByText('Total Users')).toBeVisible();

    // Entitlements status - "Entitlements" appears in multiple places, use first()
    // Look for the stats card content
    await expect(page.getByText('Entitlements').first()).toBeVisible();

    // Banned users count
    await expect(page.getByText('Banned Users')).toBeVisible();
  });

  test('should display users table with entitlements column', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for entitlements column header
    await expect(page.getByRole('columnheader', { name: /Entitlements/i })).toBeVisible();
  });

  test('should display demo users', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Demo users from in-memory store
    await expect(page.getByText('demo@example.com')).toBeVisible();
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('should display entitlement counts for users', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for entitlement counts to load
    await page.waitForTimeout(1000);

    // Should show entitlement count chips (numbers in the Entitlements column)
    const entitlementChips = page.locator('table tbody tr td:nth-child(4) .MuiChip-root');
    const count = await entitlementChips.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open entitlements lookup dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Lookup Entitlements/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'User Entitlements' })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('should lookup entitlements for demo user', async ({ page }) => {
    await page.getByRole('button', { name: /Lookup Entitlements/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Enter demo user email
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByRole('button', { name: /Lookup/i }).click();

    // Wait for results
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show user's entitlements - the email is displayed somewhere
    await expect(page.getByRole('dialog').getByText('demo@example.com')).toBeVisible();

    // Demo user has 'premium' and 'api-access' - look within dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('premium')).toBeVisible();
    await expect(dialog.getByText('api-access')).toBeVisible();
  });

  test('should show grant entitlement section in dialog (writable source)', async ({ page }) => {
    await page.getByRole('button', { name: /Lookup Entitlements/i }).click();
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByRole('button', { name: /Lookup/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show grant entitlement section (source is writable)
    // Look for the Grant button or dropdown
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: /Grant/i })).toBeVisible();
  });

  test('should show delete icons on entitlement chips (writable source)', async ({ page }) => {
    await page.getByRole('button', { name: /Lookup Entitlements/i }).click();
    await page.getByLabel(/Email/i).fill('demo@example.com');
    await page.getByRole('button', { name: /Lookup/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Entitlement chips should have delete buttons (for revoke)
    const deleteButtons = page.getByRole('dialog').locator('.MuiChip-deleteIcon');
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open entitlements dialog from user row', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click the entitlements icon in the first user row
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('button').click();

    // Should open entitlements dialog with user's email pre-filled
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'User Entitlements' })).toBeVisible();
  });

  test('should switch to Banned tab', async ({ page }) => {
    // Click Banned tab
    await page.getByRole('tab', { name: /Banned/i }).click();

    // Should show banned users table headers
    await expect(page.getByRole('columnheader', { name: /Email/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Reason/i })).toBeVisible();
  });

  test('should open Ban User dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Ban User/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ban User' })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Reason/i)).toBeVisible();
  });

  test('should filter users by search', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill('enterprise');

    // Wait for debounce
    await page.waitForTimeout(500);

    // Should show enterprise user
    await expect(page.getByText('enterprise@example.com')).toBeVisible();
  });
});
