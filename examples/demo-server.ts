/**
 * Demo Server for @qwickapps/server
 *
 * A testing server demonstrating core plugins with in-memory stores:
 *
 * Plugins Included (12 total):
 * CORE (7): postgres, cache, health, logs, config, diagnostics, maintenance
 * AUTH (4): users, bans, entitlements, auth
 * ADVANCED (1): rate-limit
 *
 * Used for Playwright e2e testing.
 *
 * Usage: npx tsx examples/demo-server.ts
 */

import {
  createControlPanel,
  createPostgresPlugin,
  createCachePlugin,
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
  createMaintenancePlugin,
  createUsersPlugin,
  createBansPlugin,
  createEntitlementsPlugin,
  createAuthPluginFromEnv,
  postgresAuthConfigStore,
  setAuthConfigStore,
  createRateLimitPlugin,
  inMemoryUserStore,
  inMemoryBanStore,
  inMemoryEntitlementSource,
  type EntitlementSource,
  type EntitlementDefinition,
  type RateLimitStore,
  type StoredLimit,
  type IncrementOptions,
} from '../src/index.js';
import { createPgMemPool } from '../src/testing/index.js';

// In-memory rate limit store for demo
function createInMemoryRateLimitStore(): RateLimitStore {
  const limits = new Map<string, StoredLimit>();
  let idCounter = 1;

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryRateLimitStore] Initialized');
    },

    async get(key: string): Promise<StoredLimit | null> {
      return limits.get(key) || null;
    },

    async increment(key: string, options: IncrementOptions): Promise<StoredLimit> {
      const now = new Date();
      const windowMs = options.windowMs;
      const windowStart = new Date(now.getTime() - (now.getTime() % windowMs));
      const windowEnd = new Date(windowStart.getTime() + windowMs);

      const existing = limits.get(key);
      if (existing && existing.windowStart.getTime() === windowStart.getTime()) {
        existing.count += options.amount || 1;
        existing.updatedAt = now;
        return existing;
      }

      const newRecord: StoredLimit = {
        id: `limit-${idCounter++}`,
        key,
        count: options.amount || 1,
        maxRequests: options.maxRequests,
        windowMs: options.windowMs,
        windowStart,
        windowEnd,
        strategy: options.strategy,
        userId: options.userId,
        tenantId: options.tenantId,
        ipAddress: options.ipAddress,
        createdAt: now,
        updatedAt: now,
      };
      limits.set(key, newRecord);
      return newRecord;
    },

    async clear(key: string): Promise<boolean> {
      return limits.delete(key);
    },

    async cleanup(): Promise<number> {
      const now = Date.now();
      let deleted = 0;
      for (const [key, record] of limits) {
        if (record.windowEnd.getTime() < now) {
          limits.delete(key);
          deleted++;
        }
      }
      return deleted;
    },

    async shutdown() {
      console.log('[InMemoryRateLimitStore] Shutdown');
      limits.clear();
    },
  };
}

async function main() {
  // Control panel runs on port 4000 by default
  const port = parseInt(process.env.PORT || '4000', 10);

  // Set up pg-mem (in-memory PostgreSQL) for auth config store
  const pool = createPgMemPool();

  // Initialize auth config store
  // Note: pg-mem doesn't support LISTEN/NOTIFY, so we disable it for demos
  const authConfigStore = postgresAuthConfigStore({
    pool,
    enableNotify: false, // pg-mem doesn't support LISTEN/NOTIFY
  });
  await authConfigStore.initialize();
  setAuthConfigStore(authConfigStore);
  console.log('[AuthConfigStore] pg-mem config store initialized (notifications disabled)');

  // Create control panel with all plugins
  const controlPanel = createControlPanel({
    config: {
      productName: 'QwickApps Demo Server',
      logoName: 'wick Demo',
      port,
      version: '1.0.0',
      mountPath: '/', // Mount at root for simpler URLs
    },
    plugins: [
      // ===== CORE PLUGINS =====

      // 1. PostgreSQL (in-memory pg-mem)
      {
        plugin: createPostgresPlugin({
          pool,
        }),
      },

      // 2. Cache (in-memory LRU)
      {
        plugin: createCachePlugin({
          type: 'memory',
          keyPrefix: 'demo:',
          defaultTtl: 3600,
          maxMemoryEntries: 5000,
        }),
      },

      // 3. Health
      {
        plugin: createHealthPlugin({
          checks: [
            {
              name: 'demo-server',
              type: 'custom',
              check: async () => ({ healthy: true }),
            },
          ],
        }),
      },

      // 4. Logs
      { plugin: createLogsPlugin() },

      // 5. Config
      {
        plugin: createConfigPlugin({
          show: ['NODE_ENV', 'PORT', 'DEMO_MODE'],
          mask: [],
        }),
      },

      // 6. Diagnostics
      { plugin: createDiagnosticsPlugin() },

      // 7. Maintenance
      {
        plugin: createMaintenancePlugin(),
      },

      // ===== AUTH PLUGINS =====
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
          cache: { enabled: false }, // Disable cache for simpler testing
        }),
      },
      // Auth plugin configured from environment variables
      // Will be disabled if AUTH_ADAPTER is not set
      { plugin: createAuthPluginFromEnv() },
      {
        plugin: createRateLimitPlugin({
          store: createInMemoryRateLimitStore(),
          defaults: {
            windowMs: 60000, // 1 minute
            maxRequests: 100,
            strategy: 'sliding-window',
          },
          cache: { type: 'memory' },
          cleanup: { enabled: true, intervalMs: 300000 },
          debug: true,
        }),
      },
    ],
  });

  // Start the control panel (starts all plugins and the server)
  await controlPanel.start();

  console.log('\n' + '='.repeat(60));
  console.log('🚀 QwickApps Demo Server');
  console.log('='.repeat(60));
  console.log('\n📦 Plugins Loaded: 12 plugins');
  console.log('  CORE (7): postgres, cache, health, logs, config, diagnostics, maintenance');
  console.log('  AUTH (4): users, bans, entitlements, auth');
  console.log('  ADVANCED (1): rate-limit');
  console.log('\n🌐 Access Points:');
  console.log(`  Control Panel: http://localhost:${port}/`);
  console.log(`  API Endpoints: http://localhost:${port}/api/*`);
  console.log('\n💾 Storage: All plugins use in-memory stores (zero external dependencies)');
  console.log('\n✨ Features Available:');
  console.log('  • User management (in-memory)');
  console.log('  • Ban management (in-memory)');
  console.log('  • Entitlements system (in-memory)');
  console.log('  • Cache management (in-memory LRU)');
  console.log('  • Rate limiting (in-memory)');
  console.log('  • Seed management (maintenance plugin)');
  console.log('  • Log management (clear logs)');
  console.log('  • Health monitoring and diagnostics');
  console.log('\n📝 Demo Users:');
  console.log('  - demo@example.com (premium, api-access)');
  console.log('  - pro@example.com (pro, beta-access, api-access)');
  console.log('  - enterprise@example.com (enterprise, all features)');
  console.log('  - basic@example.com (no entitlements)');
  console.log('='.repeat(60) + '\n');
}

main().catch((err) => {
  console.error('Failed to start demo server:', err);
  process.exit(1);
});
