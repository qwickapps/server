/**
 * Demo: Resilient Plugin Architecture with Maintenance Mode
 *
 * This demo shows how the server handles plugin initialization failures gracefully:
 * 1. Server starts even when plugins fail to initialize
 * 2. Gateway shows maintenance page at root path
 * 3. Control panel remains accessible at /cpanel
 * 4. Diagnostics endpoints provide maintenance actions
 * 5. Admin can execute recovery actions via API
 * 6. Plugins automatically retry after successful recovery
 *
 * To trigger maintenance mode:
 * - Set SIMULATE_MIGRATION_FAILURE=true to simulate a database migration issue
 * - This will cause the api-keys plugin to fail initialization
 * - The server will start normally but show maintenance page
 *
 * Access:
 * - http://localhost:3000 - Maintenance page (service unavailable)
 * - http://localhost:3000/cpanel - Control panel (accessible for recovery)
 * - http://localhost:3000/cpanel/diagnostics/maintenance - View maintenance actions
 * - POST /cpanel/diagnostics/maintenance/api-keys/truncate-api-keys-table - Execute recovery
 */

import {
  createGateway,
  // Core plugins
  createPostgresPlugin,
  createHealthPlugin,
  createDiagnosticsPlugin,
  // Auth plugins
  createUsersPlugin,
  inMemoryUserStore,
  // API Keys plugin
  createApiKeysPlugin,
  postgresApiKeyStore,
  type StoreInitializationResult,
} from '../src/index.js';
import { createPgMemPool } from '../src/testing/index.js';

/**
 * Create a wrapper around postgres API key store that can simulate failure
 */
function createDemoApiKeyStore() {
  const realStore = postgresApiKeyStore({
    pool: () => createPgMemPool(),
  });

  const shouldSimulateFailure = process.env.SIMULATE_MIGRATION_FAILURE === 'true';

  return {
    ...realStore,
    async initialize(): Promise<StoreInitializationResult> {
      if (shouldSimulateFailure) {
        console.log('[DemoStore] ❌ Simulating migration failure - table has old data without user_id');
        return {
          success: false,
          error: 'Table "api_keys" contains 5 rows without user_id column. Migration required.',
          requiresMaintenance: true,
        };
      }

      // Normal initialization
      console.log('[DemoStore] ✅ Initializing normally');
      return realStore.initialize();
    },
  };
}

async function main() {
  console.log('\n🚀 Starting QwickApps Demo Server with Resilient Plugin Architecture\n');
  console.log('════════════════════════════════════════════════════════════════════\n');

  if (process.env.SIMULATE_MIGRATION_FAILURE === 'true') {
    console.log('⚠️  SIMULATE_MIGRATION_FAILURE=true - Plugin will fail to initialize\n');
    console.log('Expected behavior:');
    console.log('  1. API Keys plugin will fail to initialize');
    console.log('  2. Server starts normally (no crash!)');
    console.log('  3. Gateway shows maintenance page at http://localhost:3000');
    console.log('  4. Control panel accessible at http://localhost:3000/cpanel');
    console.log('  5. View maintenance actions:');
    console.log('     curl http://localhost:3000/cpanel/diagnostics/maintenance');
    console.log('  6. Execute recovery action:');
    console.log('     curl -X POST http://localhost:3000/cpanel/diagnostics/maintenance/api-keys/truncate-api-keys-table');
    console.log('  7. Plugin automatically retries and succeeds');
    console.log('  8. Maintenance page disappears\n');
  } else {
    console.log('✅ SIMULATE_MIGRATION_FAILURE not set - Normal startup\n');
    console.log('To trigger maintenance mode, restart with:');
    console.log('  SIMULATE_MIGRATION_FAILURE=true pnpm tsx examples/demo-maintenance-recovery.ts\n');
  }

  console.log('════════════════════════════════════════════════════════════════════\n');

  // Create gateway with control panel
  const gateway = createGateway({
    productName: 'QwickApps Demo',
    version: '1.0.0',
    port: 3000,

    controlPanel: {
      enabled: true,
      path: '/cpanel',
      port: 3001,

      plugins: [
        // 1. PostgreSQL (in-memory for demo)
        {
          plugin: createPostgresPlugin({
            pool: createPgMemPool(),
          }),
        },

        // 2. Health monitoring
        {
          plugin: createHealthPlugin(),
        },

        // 3. Diagnostics (provides maintenance endpoints)
        {
          plugin: createDiagnosticsPlugin(),
        },

        // 4. Users (required by api-keys)
        {
          plugin: createUsersPlugin({
            store: inMemoryUserStore() as any,
          }),
        },

        // 5. API Keys (will fail if SIMULATE_MIGRATION_FAILURE=true)
        {
          plugin: createApiKeysPlugin({
            store: createDemoApiKeyStore(),
            debug: true,
          }),
        },
      ],
    },

    logging: {
      level: 'debug',
    },
  });

  // Start the gateway
  await gateway.start();

  console.log('\n✅ Server started successfully!\n');
  console.log('Access points:');
  console.log('  🌐 Gateway: http://localhost:3000');
  console.log('  🎛️  Control Panel: http://localhost:3000/cpanel');
  console.log('  🩺 Health: http://localhost:3000/cpanel/health');
  console.log('  🔧 Diagnostics: http://localhost:3000/cpanel/diagnostics/summary');
  console.log('  🛠️  Maintenance API: http://localhost:3000/cpanel/diagnostics/maintenance');
  console.log('\nPress Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    gateway.stop().then(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
