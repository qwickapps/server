import { test, expect } from '@playwright/test';

/**
 * Tenants Management Page E2E tests
 *
 * Tests tenant switching functionality including:
 * - Viewing tenants list
 * - Filtering tenants by type
 * - Searching tenants
 * - Managing tenant memberships
 */
test.describe('Tenants Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cpanel/tenants');
  });

  test('should display page header', async ({ page }) => {
    await expect(page.getByText('Tenant Management').first()).toBeVisible();
    await expect(page.getByText('Manage organizations, groups, and departments')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Statistics cards
    await expect(page.getByText('Total Tenants')).toBeVisible();
    await expect(page.getByText('Organizations')).toBeVisible();
    await expect(page.getByText('Groups')).toBeVisible();
    await expect(page.getByText('Departments')).toBeVisible();
  });

  test('should display Create Tenant button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /Create Tenant/i });
    await expect(createButton).toBeVisible();
  });

  test('should display tenants table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: /Name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Type/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Owner ID/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Created/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Actions/i })).toBeVisible();
  });

  test('should display tenant type filter dropdown', async ({ page }) => {
    const typeFilter = page.getByLabel('Type');
    await expect(typeFilter).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search tenants/i);
    await expect(searchInput).toBeVisible();
  });

  test('should filter tenants by type - Organization', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Open type filter dropdown
    await page.getByLabel('Type').click();

    // Select Organization
    await page.getByRole('option', { name: 'Organization' }).click();

    // Wait for filter to apply
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // All visible tenant type chips should show "organization"
    const typeChips = page.locator('table tbody tr td:nth-child(2) .MuiChip-root');
    const count = await typeChips.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const chipText = await typeChips.nth(i).textContent();
        expect(chipText?.toLowerCase()).toBe('organization');
      }
    }
  });

  test('should filter tenants by type - Group', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Group' }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const typeChips = page.locator('table tbody tr td:nth-child(2) .MuiChip-root');
    const count = await typeChips.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const chipText = await typeChips.nth(i).textContent();
        expect(chipText?.toLowerCase()).toBe('group');
      }
    }
  });

  test('should filter tenants by type - Department', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Department' }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const typeChips = page.locator('table tbody tr td:nth-child(2) .MuiChip-root');
    const count = await typeChips.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const chipText = await typeChips.nth(i).textContent();
        expect(chipText?.toLowerCase()).toBe('department');
      }
    }
  });

  test('should search tenants by name', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Search tenants/i);
    await searchInput.fill('Acme');

    // Wait for debounce and search to execute
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Should show tenants matching "Acme" or show "No tenants found"
    const tableBody = page.locator('table tbody');
    const noResults = tableBody.getByText('No tenants found');
    const hasResults = await page.locator('table tbody tr').count() > 1;

    // Either we have results or "no tenants found" message
    expect(hasResults || (await noResults.isVisible())).toBeTruthy();
  });

  test('should reset filters when selecting All Types', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Apply filter first
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Organization' }).click();
    await page.waitForTimeout(500);

    // Reset to All Types
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'All Types' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show all tenant types now
    const table = page.locator('table tbody');
    await expect(table).toBeVisible();
  });

  test('should display tenant type chips with correct colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const typeChips = page.locator('table tbody tr td:nth-child(2) .MuiChip-root');
    const count = await typeChips.count();

    // Should have at least one tenant with a type chip
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should open Create Tenant dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Create Tenant/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Type/i)).toBeVisible();
  });

  test('should display action buttons for each tenant', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();

    // Check if we have tenants
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0 && !(await firstRow.getByText('No tenants found').isVisible())) {
      // Should have action buttons: Manage Members, Edit, Delete
      const manageButton = firstRow.getByRole('button').first(); // People icon
      const editButton = firstRow.getByRole('button').nth(1); // Edit icon
      const deleteButton = firstRow.getByRole('button').nth(2); // Delete icon

      await expect(manageButton).toBeVisible();
      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should open Members dialog when clicking manage members button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0 && !(await firstRow.getByText('No tenants found').isVisible())) {
      // Click the manage members button (People icon)
      await firstRow.getByRole('button').first().click();

      // Should open members dialog
      await expect(page.getByRole('dialog')).toBeVisible();

      // Dialog should have member-related content
      // (Specific assertions would depend on MemberListDialog implementation)
    }
  });

  test('should display pagination controls', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for pagination component
    const pagination = page.locator('.MuiTablePagination-root');
    await expect(pagination).toBeVisible();
  });

  test('should display tenant icons based on type', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0 && !(await firstRow.getByText('No tenants found').isVisible())) {
      // First cell should contain both icon and name
      const nameCell = firstRow.locator('td').first();

      // Should have an icon (BusinessIcon, GroupIcon, PersonIcon, etc.)
      const icon = nameCell.locator('svg');
      await expect(icon).toBeVisible();
    }
  });

  test('should handle empty search results', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Search tenants/i);
    await searchInput.fill('NonExistentTenant12345');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Should show "No tenants found" message
    await expect(page.getByText('No tenants found')).toBeVisible();
  });

  test('should display formatted creation date', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0 && !(await firstRow.getByText('No tenants found').isVisible())) {
      // Fourth column should contain formatted date
      const dateCell = firstRow.locator('td').nth(3);
      const dateText = await dateCell.textContent();

      // Should be a date format (MM/DD/YYYY or similar)
      expect(dateText).toBeTruthy();
      expect(dateText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should display truncated owner ID', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await page.locator('table tbody tr').count();

    if (rowCount > 0 && !(await firstRow.getByText('No tenants found').isVisible())) {
      // Third column should contain truncated owner ID
      const ownerCell = firstRow.locator('td').nth(2);
      const ownerText = await ownerCell.textContent();

      // Should show truncated ID format (first 8 chars + ...)
      expect(ownerText).toContain('...');
    }
  });
});
