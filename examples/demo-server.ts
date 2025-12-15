/**
 * Demo Server for @qwickapps/server
 *
 * A minimal server demonstrating all built-in plugins including:
 * - Users plugin
 * - Bans plugin
 * - Entitlements plugin (with in-memory source for demo)
 *
 * Used for Playwright e2e testing.
 *
 * Usage: npx tsx examples/demo-server.ts
 */

import {
  createControlPanel,
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
  createUsersPlugin,
  createBansPlugin,
  createEntitlementsPlugin,
  createRateLimitPlugin,
  type EntitlementSource,
  type EntitlementDefinition,
  type RateLimitStore,
  type StoredLimit,
  type IncrementOptions,
} from '../src/index.js';

// In-memory entitlement source for demo/testing
function createInMemoryEntitlementSource(): EntitlementSource {
  const userEntitlements = new Map<string, string[]>();
  const availableEntitlements: EntitlementDefinition[] = [
    { id: '1', name: 'premium', category: 'subscription', description: 'Premium subscription tier' },
    { id: '2', name: 'pro', category: 'subscription', description: 'Professional subscription tier' },
    { id: '3', name: 'enterprise', category: 'subscription', description: 'Enterprise subscription tier' },
    { id: '4', name: 'beta-access', category: 'features', description: 'Access to beta features' },
    { id: '5', name: 'api-access', category: 'features', description: 'API access enabled' },
    { id: '6', name: 'support-priority', category: 'support', description: 'Priority support access' },
  ];

  // Pre-populate some demo data
  userEntitlements.set('demo@example.com', ['premium', 'api-access']);
  userEntitlements.set('pro@example.com', ['pro', 'beta-access', 'api-access']);
  userEntitlements.set('enterprise@example.com', ['enterprise', 'beta-access', 'api-access', 'support-priority']);

  return {
    name: 'in-memory',
    description: 'In-memory entitlement source for demo/testing',
    readonly: false,

    async initialize() {
      console.log('[InMemorySource] Initialized with demo data');
    },

    async getEntitlements(identifier: string): Promise<string[]> {
      return userEntitlements.get(identifier.toLowerCase()) || [];
    },

    async getAllAvailable(): Promise<EntitlementDefinition[]> {
      return availableEntitlements;
    },

    async getUsersWithEntitlement(entitlement: string) {
      const emails: string[] = [];
      userEntitlements.forEach((ents, email) => {
        if (ents.includes(entitlement)) {
          emails.push(email);
        }
      });
      return { emails, total: emails.length };
    },

    async addEntitlement(identifier: string, entitlement: string) {
      const email = identifier.toLowerCase();
      const current = userEntitlements.get(email) || [];
      if (!current.includes(entitlement)) {
        current.push(entitlement);
        userEntitlements.set(email, current);
      }
    },

    async removeEntitlement(identifier: string, entitlement: string) {
      const email = identifier.toLowerCase();
      const current = userEntitlements.get(email) || [];
      const index = current.indexOf(entitlement);
      if (index > -1) {
        current.splice(index, 1);
        userEntitlements.set(email, current);
      }
    },

    async shutdown() {
      console.log('[InMemorySource] Shutdown');
    },
  };
}

// In-memory user store for demo (implements UserStore interface)
function createInMemoryUserStore() {
  const users = new Map<string, any>();
  let idCounter = 1;

  // Pre-populate demo users
  const demoUsers = [
    { email: 'demo@example.com', name: 'Demo User' },
    { email: 'pro@example.com', name: 'Pro User' },
    { email: 'enterprise@example.com', name: 'Enterprise User' },
    { email: 'basic@example.com', name: 'Basic User' },
  ];

  demoUsers.forEach((u) => {
    const id = String(idCounter++);
    users.set(id, {
      id,
      email: u.email,
      name: u.name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryUserStore] Initialized with demo users');
    },

    async getById(id: string) {
      return users.get(id) || null;
    },

    async getByEmail(email: string) {
      for (const user of users.values()) {
        if (user.email === email.toLowerCase()) {
          return user;
        }
      }
      return null;
    },

    async getByExternalId(externalId: string, provider: string) {
      for (const user of users.values()) {
        if (user.external_id === externalId && user.provider === provider) {
          return user;
        }
      }
      return null;
    },

    async create(input: any) {
      const id = String(idCounter++);
      const user = {
        id,
        email: input.email.toLowerCase(),
        name: input.name || null,
        external_id: input.external_id,
        provider: input.provider,
        picture: input.picture,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: input.metadata || {},
      };
      users.set(id, user);
      return user;
    },

    async update(id: string, input: any) {
      const user = users.get(id);
      if (!user) return null;
      Object.assign(user, input, { updated_at: new Date() });
      return user;
    },

    async delete(id: string) {
      return users.delete(id);
    },

    async search(params: any = {}) {
      let result = Array.from(users.values());

      // Filter by query (searches email and name)
      if (params.query) {
        const query = params.query.toLowerCase();
        result = result.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            (u.name && u.name.toLowerCase().includes(query))
        );
      }

      // Filter by provider
      if (params.provider) {
        result = result.filter((u) => u.provider === params.provider);
      }

      // Sort
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const total = result.length;
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      result = result.slice(offset, offset + limit);

      return {
        users: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async updateLastLogin(id: string) {
      const user = users.get(id);
      if (user) {
        user.last_login_at = new Date();
      }
    },

    async shutdown() {
      console.log('[InMemoryUserStore] Shutdown');
    },
  };
}

// In-memory ban store for demo (implements BanStore interface)
// Note: Bans are on user_id (not email) per the BanStore interface
function createInMemoryBanStore() {
  const bans = new Map<string, any>();
  let idCounter = 1;

  function isActiveBan(ban: any): boolean {
    if (!ban.is_active) return false;
    if (ban.expires_at && new Date(ban.expires_at) <= new Date()) return false;
    return true;
  }

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryBanStore] Initialized');
    },

    async isBanned(userId: string) {
      for (const ban of bans.values()) {
        if (ban.user_id === userId && isActiveBan(ban)) {
          return true;
        }
      }
      return false;
    },

    async getActiveBan(userId: string) {
      for (const ban of bans.values()) {
        if (ban.user_id === userId && isActiveBan(ban)) {
          return ban;
        }
      }
      return null;
    },

    async createBan(input: any) {
      const id = String(idCounter++);
      const now = new Date();
      const ban = {
        id,
        user_id: input.user_id,
        reason: input.reason,
        banned_by: input.banned_by || 'system',
        banned_at: now,
        expires_at: input.duration ? new Date(now.getTime() + input.duration * 1000) : null,
        is_active: true,
        metadata: input.metadata || {},
      };
      bans.set(id, ban);
      return ban;
    },

    async removeBan(input: any) {
      for (const ban of bans.values()) {
        if (ban.user_id === input.user_id && isActiveBan(ban)) {
          ban.is_active = false;
          ban.removed_at = new Date();
          ban.removed_by = input.removed_by;
          return true;
        }
      }
      return false;
    },

    async listBans(userId: string) {
      const userBans: any[] = [];
      for (const ban of bans.values()) {
        if (ban.user_id === userId) {
          userBans.push(ban);
        }
      }
      return userBans;
    },

    async listActiveBans(options: { limit?: number; offset?: number } = {}) {
      const activeBans = Array.from(bans.values()).filter(isActiveBan);
      const total = activeBans.length;
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const result = activeBans.slice(offset, offset + limit);
      return { bans: result, total };
    },

    async cleanupExpiredBans() {
      let cleaned = 0;
      for (const ban of bans.values()) {
        if (ban.is_active && ban.expires_at && new Date(ban.expires_at) <= new Date()) {
          ban.is_active = false;
          cleaned++;
        }
      }
      return cleaned;
    },

    async shutdown() {
      console.log('[InMemoryBanStore] Shutdown');
    },
  };
}

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
  // Control panel runs on port 3101 by default (3100 is for main app services)
  const port = parseInt(process.env.PORT || '3101', 10);

  // Create control panel with all plugins
  const controlPanel = createControlPanel({
    config: {
      productName: 'QwickApps Demo Server',
      port,
      version: '1.0.0',
      mountPath: '/', // Mount at root for simpler URLs
    },
    plugins: [
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
      { plugin: createLogsPlugin() },
      {
        plugin: createConfigPlugin({
          show: ['NODE_ENV', 'PORT', 'DEMO_MODE'],
          mask: [],
        }),
      },
      { plugin: createDiagnosticsPlugin() },
      {
        plugin: createUsersPlugin({
          store: createInMemoryUserStore() as any,
        }),
      },
      {
        plugin: createBansPlugin({
          store: createInMemoryBanStore() as any,
        }),
      },
      {
        plugin: createEntitlementsPlugin({
          source: createInMemoryEntitlementSource(),
          debug: true,
          cache: { enabled: false }, // Disable cache for simpler testing
        }),
      },
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

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   QwickApps Demo Server                       ║
╠═══════════════════════════════════════════════════════════════╣
║  Control Panel: http://localhost:${port}/                        ║
║                                                               ║
║  Demo Users:                                                  ║
║    - demo@example.com (premium, api-access)                   ║
║    - pro@example.com (pro, beta-access, api-access)           ║
║    - enterprise@example.com (enterprise, all features)        ║
║    - basic@example.com (no entitlements)                      ║
║                                                               ║
║  Features Enabled:                                            ║
║    ✓ Users Plugin (in-memory)                                 ║
║    ✓ Bans Plugin (in-memory)                                  ║
║    ✓ Entitlements Plugin (in-memory, writable)                ║
║    ✓ Rate Limit Plugin (in-memory, config UI at /rate-limits) ║
║                                                               ║
║  Press Ctrl+C to stop                                         ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

main().catch((err) => {
  console.error('Failed to start demo server:', err);
  process.exit(1);
});
