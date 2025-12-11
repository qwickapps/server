import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for @qwickapps/server UI tests
 *
 * Uses the demo gateway in examples/ to provide a test environment
 * with all plugins enabled (Users, Bans, Entitlements).
 *
 * Architecture:
 *   - Gateway on port 3000 (public-facing)
 *   - Control Panel at /cpanel (proxied from port 3001)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx tsx examples/demo-gateway.ts',
    url: 'http://localhost:3000/cpanel/api/info',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
