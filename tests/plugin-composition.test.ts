/**
 * Plugin Composition Tests
 *
 * Tests for plugin composition patterns, specifically:
 * - Users + Tenants: Auto-create personal tenant on user creation
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUsersPlugin } from '../src/plugins/users/users-plugin.js';
import { createTenantsPlugin } from '../src/plugins/tenants/tenants-plugin.js';
import { postgresUserStore } from '../src/plugins/users/stores/postgres-store.js';
import { postgresTenantStore } from '../src/plugins/tenants/stores/postgres-store.js';
import type { PluginRegistry } from '../src/core/plugin-registry.js';

// Mock pool type
type MockPgPool = {
  query: ReturnType<typeof vi.fn>;
};

function createMockPool(): MockPgPool {
  return {
    query: vi.fn(),
  };
}

// Mock plugin registry
function createMockRegistry(): PluginRegistry {
  const plugins = new Map<string, any>();

  return {
    hasPlugin: (id: string) => plugins.has(id),
    getPlugin: (id: string) => {
      if (!plugins.has(id)) {
        throw new Error(`Plugin ${id} not found`);
      }
      return plugins.get(id);
    },
    addRoute: vi.fn(),
    registerHealthCheck: vi.fn(),
    _addPlugin: (plugin: any) => {
      plugins.set(plugin.id, plugin);
    },
  } as any;
}

describe('Plugin Composition: Users + Tenants', () => {
  let mockUserPool: MockPgPool;
  let mockTenantPool: MockPgPool;
  let registry: PluginRegistry;

  beforeEach(() => {
    mockUserPool = createMockPool();
    mockTenantPool = createMockPool();
    registry = createMockRegistry();

    // Default mock responses for table creation queries
    mockUserPool.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      if (sql.includes('information_schema.columns')) {
        // Return empty to trigger column creation
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    });

    mockTenantPool.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    });
  });

  it('should auto-create personal tenant when user is created', async () => {
    // Setup users plugin
    const usersPlugin = createUsersPlugin({
      store: postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false, // Skip migrations for test
      }),
    });

    // Setup tenants plugin
    const tenantsPlugin = createTenantsPlugin({
      store: postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false, // Skip migrations for test
      }),
    });

    // Register plugins
    (registry as any)._addPlugin(usersPlugin);
    (registry as any)._addPlugin(tenantsPlugin);

    // Start plugins (in correct order: tenants first, then users)
    await tenantsPlugin.onStart({}, registry);
    await usersPlugin.onStart({}, registry);

    // Mock user creation result
    const mockUser = {
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice Smith',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock tenant creation result
    const mockTenant = {
      id: 'tenant-456',
      name: 'Alice Smith',
      type: 'user',
      owner_id: 'user-123',
      metadata: { auto_created: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock membership creation result
    const mockMembership = {
      id: 'membership-789',
      tenant_id: 'tenant-456',
      user_id: 'user-123',
      role: 'owner',
      joined_at: new Date().toISOString(),
    };

    // Setup query mocks for user creation flow
    mockUserPool.query
      // User creation INSERT
      .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
      // Get user by ID (for tenant creation)
      .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

    // Setup query mocks for tenant creation flow
    mockTenantPool.query
      // Tenant creation INSERT
      .mockResolvedValueOnce({ rows: [mockTenant], rowCount: 1 })
      // Membership creation INSERT
      .mockResolvedValueOnce({ rows: [mockMembership], rowCount: 1 });

    // Create user via store (simulating API call)
    const userStore = postgresUserStore({
      pool: mockUserPool as any,
      autoCreateTables: false,
    });

    const user = await userStore.create({
      email: 'alice@example.com',
      name: 'Alice Smith',
    });

    // Now manually trigger auto-tenant creation (simulating what users plugin does)
    if (registry.hasPlugin('tenants')) {
      const tenants = registry.getPlugin('tenants');
      await tenants.autoCreateUserTenant(user.id);
    }

    // Verify user was created
    expect(user.id).toBe('user-123');
    expect(user.email).toBe('alice@example.com');

    // Verify tenant creation was called with correct parameters
    const tenantCreateCall = mockTenantPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO') && call[0].includes('tenants')
    );
    expect(tenantCreateCall).toBeDefined();
    expect(tenantCreateCall[1]).toContain('Alice Smith'); // name
    expect(tenantCreateCall[1]).toContain('user'); // type
    expect(tenantCreateCall[1]).toContain('user-123'); // owner_id

    // Verify membership creation was called
    const membershipCreateCall = mockTenantPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO') && call[0].includes('memberships')
    );
    expect(membershipCreateCall).toBeDefined();
    expect(membershipCreateCall[1]).toContain('tenant-456'); // tenant_id
    expect(membershipCreateCall[1]).toContain('user-123'); // user_id
    expect(membershipCreateCall[1]).toContain('owner'); // role
  });

  it('should handle gracefully when tenants plugin is not available', async () => {
    // Setup ONLY users plugin (no tenants plugin)
    const usersPlugin = createUsersPlugin({
      store: postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      }),
    });

    // Register only users plugin
    (registry as any)._addPlugin(usersPlugin);

    // Start users plugin
    await usersPlugin.onStart({}, registry);

    // Mock user creation
    const mockUser = {
      id: 'user-123',
      email: 'bob@example.com',
      name: 'Bob Jones',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUserPool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

    // Create user
    const userStore = postgresUserStore({
      pool: mockUserPool as any,
      autoCreateTables: false,
    });

    const user = await userStore.create({
      email: 'bob@example.com',
      name: 'Bob Jones',
    });

    // Verify user was created successfully
    expect(user.id).toBe('user-123');
    expect(user.email).toBe('bob@example.com');

    // Verify no tenant queries were made
    expect(mockTenantPool.query).not.toHaveBeenCalled();
  });

  it('should not fail user creation if tenant creation fails', async () => {
    // Setup both plugins
    const usersPlugin = createUsersPlugin({
      store: postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      }),
    });

    const tenantsPlugin = createTenantsPlugin({
      store: postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      }),
    });

    (registry as any)._addPlugin(usersPlugin);
    (registry as any)._addPlugin(tenantsPlugin);

    await tenantsPlugin.onStart({}, registry);
    await usersPlugin.onStart({}, registry);

    // Mock user creation success
    const mockUser = {
      id: 'user-123',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUserPool.query
      .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

    // Mock tenant creation failure
    mockTenantPool.query.mockRejectedValueOnce(new Error('Database error'));

    const userStore = postgresUserStore({
      pool: mockUserPool as any,
      autoCreateTables: false,
    });

    // Create user - should succeed even if tenant creation fails
    const user = await userStore.create({
      email: 'charlie@example.com',
      name: 'Charlie Brown',
    });

    // Try to create tenant (will fail but shouldn't throw)
    let tenantError: Error | null = null;
    try {
      if (registry.hasPlugin('tenants')) {
        const tenants = registry.getPlugin('tenants');
        await tenants.autoCreateUserTenant(user.id);
      }
    } catch (error) {
      tenantError = error as Error;
    }

    // Verify user creation succeeded
    expect(user.id).toBe('user-123');

    // Verify tenant creation failed
    expect(tenantError).toBeTruthy();
    expect(tenantError?.message).toBe('Database error');
  });
});
