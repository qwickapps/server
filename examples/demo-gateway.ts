/**
 * Demo Gateway for @qwickapps/server
 *
 * A full gateway example demonstrating:
 * - Gateway on port 4100 (public)
 * - Control panel at /cpanel (proxied from port 4101)
 * - All built-in plugins (Users, Bans, Entitlements, Tenants)
 *
 * Architecture (Gateway Proxy Pattern):
 *   Internet → Gateway (:4100) → Control Panel (:4101)
 *
 * Port Scheme:
 *   - 4100: Gateway (public-facing)
 *   - 4101: Control Panel (internal, runs at /)
 *
 * Usage: npx tsx examples/demo-gateway.ts
 */

import {
  createGateway,
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
  createUsersPlugin,
  createBansPlugin,
  createEntitlementsPlugin,
  createTenantsPlugin,
  inMemoryUserStore,
  inMemoryBanStore,
  inMemoryEntitlementSource,
  inMemoryTenantStore,
} from '../src/index.js';

async function main() {
  // Port scheme: 4100 gateway (public), 4101 cpanel (internal)
  const gatewayPort = parseInt(process.env.GATEWAY_PORT || process.env.PORT || '4100', 10);
  const cpanelPort = parseInt(process.env.CPANEL_PORT || '4101', 10);

  // Create gateway with control panel
  const gateway = createGateway({
    productName: 'QwickApps Demo Gateway',
    version: '1.0.0',
    port: gatewayPort,

    // Control panel configuration
    controlPanel: {
      enabled: true,
      path: '/cpanel',
      port: cpanelPort,
      plugins: [
        {
          plugin: createHealthPlugin({
            checks: [
              {
                name: 'demo-gateway',
                type: 'custom',
                check: async () => ({ healthy: true }),
              },
            ],
          }),
        },
        { plugin: createLogsPlugin() },
        {
          plugin: createConfigPlugin({
            show: ['NODE_ENV', 'PORT', 'GATEWAY_PORT', 'CPANEL_PORT', 'DEMO_MODE'],
            mask: [],
          }),
        },
        { plugin: createDiagnosticsPlugin() },
        {
          plugin: createUsersPlugin({
            store: inMemoryUserStore() as any,
          }),
        },
        {
          plugin: createBansPlugin({
            store: inMemoryBanStore() as any,
          }),
        },
        {
          plugin: createEntitlementsPlugin({
            source: inMemoryEntitlementSource(),
            debug: true,
            cache: { enabled: false },
          }),
        },
        {
          plugin: createTenantsPlugin({
            store: inMemoryTenantStore() as any,
            apiPrefix: '/api/tenants',
          }),
        },
      ],
    },

    // Frontend app configuration (landing page at /)
    frontendApp: {
      landingPage: {
        title: 'QwickApps Demo',
        heading: 'Welcome to QwickApps Demo',
        description: 'This demo showcases the Gateway Proxy Pattern with entitlements and user management features.',
        links: [
          { label: 'Control Panel', url: '/cpanel' },
          { label: 'API Health', url: '/cpanel/api/health' },
        ],
        branding: {
          primaryColor: '#6366f1',
        },
      },
    },
  });

  await gateway.start();

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              QwickApps Demo Gateway (v1.3.0)                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Architecture: Gateway Proxy Pattern                          ║
║                                                               ║
║  Public Gateway:    http://localhost:${gatewayPort}/                    ║
║  Control Panel:     http://localhost:${gatewayPort}/cpanel              ║
║  (Internal CP):     http://localhost:${cpanelPort}/                    ║
║                                                               ║
║  Demo Users:                                                  ║
║    - demo@example.com (premium, api-access)                   ║
║    - pro@example.com (pro, beta-access, api-access)           ║
║    - enterprise@example.com (enterprise, all features)        ║
║    - basic@example.com (no entitlements)                      ║
║                                                               ║
║  Features Enabled:                                            ║
║    ✓ Gateway Proxy Pattern (apps isolated by port)            ║
║    ✓ Control Panel (at /cpanel, runs at / on port ${cpanelPort})       ║
║    ✓ Users Plugin (in-memory)                                 ║
║    ✓ Bans Plugin (in-memory)                                  ║
║    ✓ Entitlements Plugin (in-memory, writable)                ║
║    ✓ Tenants Plugin (in-memory)                               ║
║                                                               ║
║  Press Ctrl+C to stop                                         ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

main().catch((err) => {
  console.error('Failed to start demo gateway:', err);
  process.exit(1);
});
