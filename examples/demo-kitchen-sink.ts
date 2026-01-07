/**
 * Kitchen-Sink Demo - Comprehensive showcase of all qwickapps-server plugins
 *
 * This demo configures a gateway with ALL 19 plugins enabled, providing:
 * - Complete feature demonstration with UI components
 * - Reference implementation
 * - E2E testing ground
 *
 * Plugins with UI Components (19 total):
 *
 * CORE INFRASTRUCTURE (6):
 *   - postgres: PostgreSQL database connection pooling
 *   - cache: Redis caching with fallback
 *   - health: Service health monitoring
 *   - diagnostics: System diagnostics
 *   - logs: Log viewing and aggregation
 *   - config: Configuration viewer
 *
 * USER & AUTH MANAGEMENT (5):
 *   - auth: Authentication adapter
 *   - api-keys: API key management
 *   - users: User management with CRUD
 *   - bans: User ban management
 *   - preferences: User preferences storage
 *
 * BUSINESS LOGIC (6):
 *   - devices: Device registration and management
 *   - profiles: User profile management
 *   - subscriptions: Subscription lifecycle
 *   - entitlements: Feature entitlements
 *   - usage: Usage tracking and quotas
 *   - parental: Parental controls
 *
 * ADVANCED FEATURES (2 + frontend):
 *   - notifications: SSE-based real-time notifications
 *   - rate-limit: API rate limiting
 *   - qwickbrain: AI knowledge base integration
 *   - frontend-app: Root path and landing page
 *
 * Each plugin exposes:
 *   - StatusWidget: Dashboard card showing key metrics
 *   - ManagementPage: Full admin interface (except config, frontend-app)
 *
 * Usage:
 *   pnpm tsx examples/demo-kitchen-sink.ts
 *
 * Then visit: http://localhost:3200/cpanel
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { createGateway } from '../src/index.js';
import {
  createPostgresPlugin,
  createCachePlugin,
  createHealthPlugin,
  createDiagnosticsPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createAuthPluginFromEnv,
  createApiKeysPlugin,
  createUsersPlugin,
  createBansPlugin,
  createPreferencesPlugin,
  createDevicesPlugin,
  createProfilesPlugin,
  createSubscriptionsPlugin,
  createEntitlementsPlugin,
  createUsagePlugin,
  createParentalPlugin,
  createNotificationsPlugin,
  createRateLimitPluginFromEnv,
  createQwickBrainPlugin,
  createFrontendAppPlugin,
  postgresUserStore,
  postgresPreferencesStore,
} from '../src/plugins/index.js';
import { Pool } from 'pg';

// Environment configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/qwickapps_demo';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const GATEWAY_PORT = Number(process.env.GATEWAY_PORT) || 3200;
const SERVICE_PORT = Number(process.env.SERVICE_PORT) || 3199;

async function main() {
  console.log('🚀 Starting Kitchen-Sink Demo...');
  console.log(`📊 Database: ${DATABASE_URL}`);
  console.log(`🔴 Redis: ${REDIS_URL}`);
  console.log(`🌐 Gateway: http://localhost:${GATEWAY_PORT}/cpanel`);

  // Create PostgreSQL pool for plugins that need it
  const pool = new Pool({ connectionString: DATABASE_URL });

  // Create gateway with ALL plugins
  const gateway = await createGateway(
    {
      productName: 'Kitchen-Sink Demo',
      version: '1.0.0',
      gatewayPort: GATEWAY_PORT,
      servicePort: SERVICE_PORT,
      controlPanelPath: '/cpanel',
      controlPanelGuard: {
        type: 'basic',
        username: 'admin',
        password: process.env.ADMIN_PASSWORD || 'demo123',
        realm: 'Kitchen-Sink Demo',
        excludePaths: ['/health', '/api/health'],
      },
      proxyPaths: ['/api/v1'],
      plugins: [
        //
        // === CORE INFRASTRUCTURE ===
        //

        // PostgreSQL - Database connection pooling
        createPostgresPlugin({
          connectionString: DATABASE_URL,
          maxConnections: 20,
          healthCheckInterval: 30000,
        }),

        // Cache - Redis caching
        createCachePlugin({
          url: REDIS_URL,
          keyPrefix: 'demo:',
          defaultTTL: 3600,
          healthCheckInterval: 30000,
        }),

        // Health - Service health monitoring
        createHealthPlugin({
          checks: [
            {
              name: 'database',
              type: 'http',
              url: `http://localhost:${SERVICE_PORT}/health`,
              interval: 10000,
            },
          ],
        }),

        // Diagnostics - System diagnostics
        createDiagnosticsPlugin({}),

        // Logs - Log viewing and aggregation
        createLogsPlugin({
          sources: [
            { name: 'app', type: 'file', path: './logs/app.log' },
            { name: 'error', type: 'file', path: './logs/error.log' },
          ],
        }),

        // Config - Configuration viewer
        createConfigPlugin({
          show: ['NODE_ENV', 'DATABASE_URL', 'REDIS_URL'],
          mask: ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'],
        }),

        //
        // === USER & AUTH MANAGEMENT ===
        //

        // Auth - Authentication adapter
        createAuthPluginFromEnv(),

        // API Keys - API key management
        createApiKeysPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Users - User management
        createUsersPlugin({
          store: postgresUserStore({
            pool,
            usersTable: 'users',
            bansTable: 'user_bans',
            autoCreateTables: true,
          }),
          bans: {
            enabled: true,
            supportTemporary: true,
          },
          api: {
            prefix: '/api/users',
            crud: true,
            search: true,
            bans: true,
          },
        }),

        // Bans - Ban management
        createBansPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Preferences - User preferences storage
        createPreferencesPlugin({
          store: postgresPreferencesStore({
            pool,
            tableName: 'user_preferences',
            autoCreateTables: true,
            enableRLS: true,
          }),
          defaults: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
            },
          },
          api: {
            prefix: '/api/preferences',
            enabled: true,
          },
        }),

        //
        // === BUSINESS LOGIC ===
        //

        // Devices - Device management
        createDevicesPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Profiles - User profile management
        createProfilesPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Subscriptions - Subscription management
        createSubscriptionsPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Entitlements - Feature entitlements
        createEntitlementsPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Usage - Usage tracking and quotas
        createUsagePlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        // Parental - Parental controls
        createParentalPlugin({
          store: 'postgres',
          autoCreateTables: true,
        }),

        //
        // === ADVANCED FEATURES ===
        //

        // Notifications - SSE-based notifications
        createNotificationsPlugin({
          channels: ['events', 'messages', 'alerts'],
          heartbeat: { interval: 60000 },
          api: { prefix: '/api/notifications' },
        }),

        // Rate Limit - API rate limiting
        createRateLimitPluginFromEnv(),

        // QwickBrain - Knowledge base integration
        createQwickBrainPlugin({
          apiUrl: process.env.QWICKBRAIN_API_URL || 'http://localhost:3300',
          enabled: Boolean(process.env.QWICKBRAIN_API_URL),
        }),

        // Frontend App - Root path handler
        createFrontendAppPlugin({
          landingPage: {
            title: 'Kitchen-Sink Demo',
            heading: 'QwickApps Server',
            description: 'Comprehensive demonstration of all plugins',
            links: [
              { label: 'Control Panel', url: '/cpanel' },
              { label: 'API Docs', url: '/api/docs' },
            ],
          },
        }),
      ],
    },
    // Service factory
    async (port) => {
      const express = await import('express');
      const app = express.default();

      app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      app.get('/api/v1/demo', (req, res) => {
        res.json({ message: 'Kitchen-Sink Demo API', version: '1.0.0' });
      });

      const server = app.listen(port);

      return {
        app,
        server,
        shutdown: async () => {
          server.close();
        },
      };
    }
  );

  await gateway.start();

  console.log('✅ Kitchen-Sink Demo is running!');
  console.log(`\n📍 Control Panel: http://localhost:${GATEWAY_PORT}/cpanel`);
  console.log(`   Username: admin`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'demo123'}`);
  console.log(`\n📍 Landing Page: http://localhost:${GATEWAY_PORT}/`);
  console.log(`\n📍 API: http://localhost:${GATEWAY_PORT}/api/v1/demo`);
  console.log(`\n📍 Health: http://localhost:${GATEWAY_PORT}/health`);
  console.log(`\nPress Ctrl+C to stop.`);
}

main().catch((error) => {
  console.error('❌ Failed to start Kitchen-Sink Demo:', error);
  process.exit(1);
});
