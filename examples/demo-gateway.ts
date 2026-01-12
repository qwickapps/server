/**
 * Demo Gateway for @qwickapps/server
 *
 * A full gateway example demonstrating:
 * - Gateway on port 3000 (public)
 * - Control panel at /cpanel (proxied from port 3001)
 * - All built-in plugins (Users, Bans, Entitlements)
 *
 * Architecture (Gateway Proxy Pattern):
 *   Internet → Gateway (:3000) → Control Panel (:3001)
 *
 * Port Scheme:
 *   - 3000: Gateway (public-facing)
 *   - 3001: Control Panel (internal, runs at /)
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
  type EntitlementSource,
  type EntitlementDefinition,
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

      if (params.query) {
        const query = params.query.toLowerCase();
        result = result.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            (u.name && u.name.toLowerCase().includes(query))
        );
      }

      if (params.provider) {
        result = result.filter((u) => u.provider === params.provider);
      }

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

// In-memory ban store for demo
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

// In-memory tenant store for demo
function createInMemoryTenantStore() {
  const tenants = new Map<string, any>();
  const memberships = new Map<string, any>();
  let tenantIdCounter = 1;
  let membershipIdCounter = 1;

  // Pre-populate demo tenants
  const demoTenants = [
    { name: 'Acme Corporation', type: 'organization', owner_id: '1' },
    { name: 'Engineering Team', type: 'group', owner_id: '1' },
    { name: 'Finance Department', type: 'department', owner_id: '2' },
    { name: 'Demo User Workspace', type: 'user', owner_id: '1' },
  ];

  demoTenants.forEach((t) => {
    const id = `tenant-${tenantIdCounter++}`;
    tenants.set(id, {
      id,
      name: t.name,
      type: t.type,
      owner_id: t.owner_id,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Auto-create membership for owner
    const membershipId = `membership-${membershipIdCounter++}`;
    memberships.set(membershipId, {
      id: membershipId,
      tenant_id: id,
      user_id: t.owner_id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    });
  });

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryTenantStore] Initialized with demo tenants');
    },

    async getById(id: string) {
      return tenants.get(id) || null;
    },

    async getByIds(ids: string[]) {
      return ids.map(id => tenants.get(id)).filter(Boolean);
    },

    async getByName(name: string) {
      for (const tenant of tenants.values()) {
        if (tenant.name.toLowerCase() === name.toLowerCase()) {
          return tenant;
        }
      }
      return null;
    },

    async create(input: any) {
      const id = `tenant-${tenantIdCounter++}`;
      const tenant = {
        id,
        name: input.name,
        type: input.type,
        owner_id: input.owner_id,
        metadata: input.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      tenants.set(id, tenant);

      // Auto-create membership for owner
      const membershipId = `membership-${membershipIdCounter++}`;
      memberships.set(membershipId, {
        id: membershipId,
        tenant_id: id,
        user_id: input.owner_id,
        role: 'owner',
        joined_at: new Date().toISOString(),
      });

      return tenant;
    },

    async update(id: string, input: any) {
      const tenant = tenants.get(id);
      if (!tenant) return null;
      Object.assign(tenant, input, { updated_at: new Date().toISOString() });
      return tenant;
    },

    async delete(id: string) {
      // Delete all memberships for this tenant
      for (const [key, membership] of memberships.entries()) {
        if (membership.tenant_id === id) {
          memberships.delete(key);
        }
      }
      return tenants.delete(id);
    },

    async search(params: any = {}) {
      let result = Array.from(tenants.values());

      if (params.query) {
        const query = params.query.toLowerCase();
        result = result.filter(t => t.name.toLowerCase().includes(query));
      }

      if (params.type) {
        result = result.filter(t => t.type === params.type);
      }

      if (params.owner_id) {
        result = result.filter(t => t.owner_id === params.owner_id);
      }

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
        tenants: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async getTenantsForUser(userId: string) {
      const userMemberships = Array.from(memberships.values()).filter(
        m => m.user_id === userId
      );
      const tenantIds = userMemberships.map(m => m.tenant_id);
      return tenantIds.map(id => tenants.get(id)).filter(Boolean);
    },

    async getMembers(tenantId: string) {
      return Array.from(memberships.values()).filter(
        m => m.tenant_id === tenantId
      );
    },

    async getMembership(tenantId: string, userId: string) {
      for (const membership of memberships.values()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          return membership;
        }
      }
      return null;
    },

    async addMember(input: any) {
      const id = `membership-${membershipIdCounter++}`;
      const membership = {
        id,
        tenant_id: input.tenant_id,
        user_id: input.user_id,
        role: input.role,
        joined_at: new Date().toISOString(),
      };
      memberships.set(id, membership);
      return membership;
    },

    async updateMember(tenantId: string, userId: string, input: any) {
      for (const membership of memberships.values()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          Object.assign(membership, input);
          return membership;
        }
      }
      return null;
    },

    async removeMember(tenantId: string, userId: string) {
      for (const [key, membership] of memberships.entries()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          memberships.delete(key);
          return true;
        }
      }
      return false;
    },

    async shutdown() {
      console.log('[InMemoryTenantStore] Shutdown');
    },
  };
}

async function main() {
  // Port scheme: 3000 gateway (public), 3001 cpanel (internal)
  const gatewayPort = parseInt(process.env.GATEWAY_PORT || process.env.PORT || '3000', 10);
  const cpanelPort = parseInt(process.env.CPANEL_PORT || '3001', 10);

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
            cache: { enabled: false },
          }),
        },
        {
          plugin: createTenantsPlugin({
            store: createInMemoryTenantStore() as any,
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
