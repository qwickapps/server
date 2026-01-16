/**
 * Demo All - Comprehensive showcase for @qwickapps/server
 *
 * Demonstrates core qwickapps-server plugins with in-memory stores
 * for E2E testing, learning, and development.
 *
 * Plugins Included (12 total):
 * CORE (6): postgres, health, diagnostics, logs, config, maintenance
 * AUTH (5): auth, users, bans, entitlements, tenants
 * ADVANCED (1): notifications
 *
 * Architecture (Control Panel Proxy Pattern):
 *   Internet → Control Panel (:4000)
 *   - /cpanel/* served by control panel
 *   - /api/* served by control panel plugins
 *   - /* landing page served by control panel
 *
 * Port Scheme:
 *   - 4000: Control Panel (public-facing, serves everything)
 *
 * Usage: npm run demo:all
 * Access: http://localhost:4000/cpanel (admin / demo123)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import {
  createControlPanel,
  // Core plugins
  createPostgresPlugin,
  createHealthPlugin,
  createDiagnosticsPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createMaintenancePlugin,
  // Auth plugins
  createAuthPlugin,
  basicAdapter,
  createUsersPlugin,
  createBansPlugin,
  createEntitlementsPlugin,
  createTenantsPlugin,
  // Advanced plugins
  createNotificationsPlugin,
  // In-memory stores and test utilities (relocated in Phase 1)
  inMemoryUserStore,
  inMemoryBanStore,
  inMemoryEntitlementSource,
  inMemoryTenantStore,
} from '../src/index.js';
import { createPgMemPool } from '../src/testing/index.js';

async function main() {
  // Port scheme: 4000 control panel (public-facing, serves everything)
  const port = parseInt(process.env.PORT || '4000', 10);

  // Create control panel with all plugins
  const controlPanel = createControlPanel({
    config: {
      productName: 'QwickApps Showcase',
      logoName: 'wickApps Demo',
      version: '1.0.0',
      port,
      mountPath: '/cpanel',
      // Basic auth guard (admin / demo123)
      guard: {
        type: 'basic',
        username: 'admin',
        password: 'demo123',
      },
      // Disable default landing page - we'll add custom one
      landingPage: false,
    },
    plugins: [
        // ===== CORE PLUGINS (6) =====

        // 1. PostgreSQL (in-memory)
        {
          plugin: createPostgresPlugin({
            pool: createPgMemPool(),
          }),
        },

        // 2. Health
        {
          plugin: createHealthPlugin({
            checks: [
              {
                name: 'demo-all',
                type: 'custom',
                check: async () => ({ healthy: true, message: 'All plugins loaded successfully' }),
              },
            ],
          }),
        },

        // 3. Diagnostics
        { plugin: createDiagnosticsPlugin() },

        // 4. Logs
        { plugin: createLogsPlugin() },

        // 5. Config
        {
          plugin: createConfigPlugin({
            show: ['NODE_ENV', 'PORT', 'GATEWAY_PORT', 'CPANEL_PORT'],
            mask: [],
          }),
        },

        // 6. Maintenance
        {
          plugin: createMaintenancePlugin(),
        },

        // ===== AUTH PLUGINS (5) =====

        // 7. Auth (basic adapter)
        {
          plugin: createAuthPlugin({
            authRequired: true,
            debug: true,
            adapter: basicAdapter({
              username: 'admin',
              password: 'demo123',
            }),
          }),
        },

        // 8. Users
        {
          plugin: createUsersPlugin({
            store: inMemoryUserStore() as any,
          }),
        },

        // 9. Bans
        {
          plugin: createBansPlugin({
            store: inMemoryBanStore() as any,
          }),
        },

        // 10. Entitlements
        {
          plugin: createEntitlementsPlugin({
            source: inMemoryEntitlementSource(),
            debug: true,
            cache: { enabled: false },
          }),
        },

        // 11. Tenants
        {
          plugin: createTenantsPlugin({
            store: inMemoryTenantStore() as any,
            apiPrefix: '',
          }),
        },

        // ===== ADVANCED PLUGINS (1) =====

        // 12. Notifications
        {
          plugin: createNotificationsPlugin({
            channels: ['app_events'],
            enabled: true,
          }),
        },
      ],
  });

  // Start control panel
  await controlPanel.start();

  // Add landing page at root (after control panel starts)
  // Skip proxy for /cpanel/* and /api/* - serve them locally
  controlPanel.app.get('/', (_req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QwickApps Showcase</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 48px;
    }
    h1 {
      color: #1a202c;
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    p {
      color: #4a5568;
      font-size: 1.125rem;
      line-height: 1.75;
      margin-bottom: 32px;
    }
    .links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .link {
      display: block;
      padding: 16px 24px;
      background: #6366f1;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
    }
    .meta {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e2e8f0;
      color: #718096;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 QwickApps Showcase</h1>
    <p>
      Comprehensive showcase of core qwickapps-server plugins with in-memory stores.
      Perfect for E2E testing, learning the framework capabilities, and seeing plugins working together.
    </p>
    <div class="links">
      <a href="/cpanel" class="link">Control Panel</a>
      <a href="/api/health" class="link">Health Check</a>
      <a href="/cpanel/users" class="link">Users</a>
      <a href="/cpanel/entitlements" class="link">Entitlements</a>
    </div>
    <div class="meta">
      <strong>Plugins:</strong> 12 total (6 CORE, 5 AUTH, 1 ADVANCED)<br>
      <strong>Storage:</strong> All in-memory (zero external dependencies)<br>
      <strong>Architecture:</strong> Control Panel Proxy Pattern
    </div>
  </div>
</body>
</html>
    `;
    res.type('html').send(html);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🚀 QwickApps Showcase');
  console.log('='.repeat(60));
  console.log('\n📦 Plugins Loaded: 12 plugins');
  console.log('  CORE (6): postgres, health, diagnostics, logs, config, maintenance');
  console.log('  AUTH (5): auth, users, bans, entitlements, tenants');
  console.log('  ADVANCED (1): notifications');
  console.log('\n🌐 Access Points:');
  console.log(`  Landing Page:  http://localhost:${port}`);
  console.log(`  Control Panel: http://localhost:${port}/cpanel`);
  console.log(`  API Endpoints: http://localhost:${port}/api/*`);
  console.log(`  Credentials:   admin / demo123`);
  console.log('\n💾 Storage: All plugins use in-memory stores (zero external dependencies)');
  console.log('\n✨ Architecture: Control Panel Proxy Pattern');
  console.log('  • Control panel runs on single port (4000)');
  console.log('  • /cpanel/* served by control panel UI');
  console.log('  • /api/* served by control panel plugins');
  console.log('  • / landing page served by control panel');
  console.log('\n✨ Features Demonstrated:');
  console.log('  • User management with demo data');
  console.log('  • Ban management for user restrictions');
  console.log('  • Entitlements for feature gating');
  console.log('  • Multi-tenant data isolation (4 demo tenants)');
  console.log('  • Real-time SSE notifications');
  console.log('  • Health monitoring and diagnostics');
  console.log('='.repeat(60) + '\n');
}

// Run the demo
main().catch((error) => {
  console.error('Failed to start demo:', error);
  process.exit(1);
});
