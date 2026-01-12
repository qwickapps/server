/**
 * Multi-Tenancy Integration Tests
 *
 * Tests for multi-tenancy workflows across users and tenants plugins:
 * - Full user signup → auto-tenant creation → membership workflow
 * - Multi-user organization scenarios
 * - Membership management
 * - Tenant switching
 * - Cross-plugin integration
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUsersPlugin } from '../src/plugins/users/users-plugin.js';
import { createTenantsPlugin } from '../src/plugins/tenants/tenants-plugin.js';
import { postgresUserStore } from '../src/plugins/users/stores/postgres-store.js';
import { postgresTenantStore } from '../src/plugins/tenants/stores/postgres-store.js';
import type { PluginRegistry } from '../src/core/plugin-registry.js';
import type { User } from '../src/plugins/users/types.js';
import type { Tenant, TenantMembership } from '../src/plugins/tenants/types.js';

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

describe('Multi-Tenancy Integration Tests', () => {
  let mockUserPool: MockPgPool;
  let mockTenantPool: MockPgPool;
  let registry: PluginRegistry;
  let usersPlugin: any;
  let tenantsPlugin: any;

  beforeEach(() => {
    mockUserPool = createMockPool();
    mockTenantPool = createMockPool();
    registry = createMockRegistry();

    // Default mock responses for table creation queries
    mockUserPool.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE') || sql.includes('information_schema.columns')) {
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

    // Setup plugins
    usersPlugin = createUsersPlugin({
      store: postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      }),
    });

    tenantsPlugin = createTenantsPlugin({
      store: postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      }),
    });

    (registry as any)._addPlugin(usersPlugin);
    (registry as any)._addPlugin(tenantsPlugin);
  });

  describe('Full User Signup Workflow', () => {
    it('should complete full signup: user → personal tenant → membership', async () => {
      await tenantsPlugin.onStart({}, registry);
      await usersPlugin.onStart({}, registry);

      const mockUser: User = {
        id: 'user-alice',
        email: 'alice@example.com',
        name: 'Alice Smith',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTenant: Tenant = {
        id: 'tenant-alice',
        name: 'Alice Smith',
        type: 'user',
        owner_id: 'user-alice',
        metadata: { auto_created: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockMembership: TenantMembership = {
        id: 'membership-alice',
        tenant_id: 'tenant-alice',
        user_id: 'user-alice',
        role: 'owner',
        joined_at: new Date().toISOString(),
      };

      // Setup query mocks for the full workflow
      mockUserPool.query
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 }) // User creation
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 }); // Get user by ID

      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [mockTenant], rowCount: 1 }) // Tenant creation
        .mockResolvedValueOnce({ rows: [mockMembership], rowCount: 1 }); // Membership creation

      // Create user
      const userStore = postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      });

      const user = await userStore.create({
        email: 'alice@example.com',
        name: 'Alice Smith',
      });

      // Auto-create tenant (simulating users plugin behavior)
      await tenantsPlugin.autoCreateUserTenant(user.id);

      // Verify user created
      expect(user.id).toBe('user-alice');
      expect(user.email).toBe('alice@example.com');
      expect(user.name).toBe('Alice Smith');

      // Verify tenant creation call
      const tenantCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('INSERT INTO') && call[0].includes('tenants')
      );
      expect(tenantCalls).toHaveLength(1);
      expect(tenantCalls[0][1]).toEqual(
        expect.arrayContaining(['Alice Smith', 'user', 'user-alice'])
      );

      // Verify membership creation call
      const membershipCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('INSERT INTO') && call[0].includes('memberships')
      );
      expect(membershipCalls.length).toBeGreaterThanOrEqual(1);
      const insertCall = membershipCalls.find(call => call[1] && call[1].length >= 3);
      expect(insertCall).toBeDefined();
      expect(insertCall[1]).toEqual(
        expect.arrayContaining(['tenant-alice', 'user-alice', 'owner'])
      );
    });

    it('should use email as tenant name when user has no name', async () => {
      await tenantsPlugin.onStart({}, registry);
      await usersPlugin.onStart({}, registry);

      const mockUser: User = {
        id: 'user-bob',
        email: 'bob@example.com',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTenant: Tenant = {
        id: 'tenant-bob',
        name: 'bob@example.com',
        type: 'user',
        owner_id: 'user-bob',
        metadata: { auto_created: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockMembership: TenantMembership = {
        id: 'membership-bob',
        tenant_id: 'tenant-bob',
        user_id: 'user-bob',
        role: 'owner',
        joined_at: new Date().toISOString(),
      };

      mockUserPool.query
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [mockTenant], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockMembership], rowCount: 1 });

      const userStore = postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      });

      const user = await userStore.create({
        email: 'bob@example.com',
      });

      await tenantsPlugin.autoCreateUserTenant(user.id);

      // Verify tenant name is email when no name provided
      const tenantCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('INSERT INTO') && call[0].includes('tenants')
      );
      expect(tenantCalls[0][1][0]).toBe('bob@example.com'); // First param is name
    });
  });

  describe('Multi-User Organization Scenarios', () => {
    it('should create organization with multiple members', async () => {
      await tenantsPlugin.onStart({}, registry);
      await usersPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      // Mock organization creation
      const mockOrg: Tenant = {
        id: 'org-acme',
        name: 'Acme Corp',
        type: 'organization',
        owner_id: 'user-alice',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockMembership1: TenantMembership = {
        id: 'membership-1',
        tenant_id: 'org-acme',
        user_id: 'user-alice',
        role: 'owner',
        joined_at: new Date().toISOString(),
      };

      const mockMembership2: TenantMembership = {
        id: 'membership-2',
        tenant_id: 'org-acme',
        user_id: 'user-bob',
        role: 'admin',
        joined_at: new Date().toISOString(),
      };

      const mockMembership3: TenantMembership = {
        id: 'membership-3',
        tenant_id: 'org-acme',
        user_id: 'user-charlie',
        role: 'member',
        joined_at: new Date().toISOString(),
      };

      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [mockOrg], rowCount: 1 }) // Create org
        .mockResolvedValueOnce({ rows: [mockMembership1], rowCount: 1 }) // Add owner
        .mockResolvedValueOnce({ rows: [mockMembership2], rowCount: 1 }) // Add admin
        .mockResolvedValueOnce({ rows: [mockMembership3], rowCount: 1 }); // Add member

      // Create organization
      const org = await tenantStore.create({
        name: 'Acme Corp',
        type: 'organization',
        owner_id: 'user-alice',
      });

      // Add members with different roles
      await tenantStore.addMember({
        tenant_id: org.id,
        user_id: 'user-alice',
        role: 'owner',
      });

      await tenantStore.addMember({
        tenant_id: org.id,
        user_id: 'user-bob',
        role: 'admin',
      });

      await tenantStore.addMember({
        tenant_id: org.id,
        user_id: 'user-charlie',
        role: 'member',
      });

      // Verify organization creation
      expect(org.type).toBe('organization');
      expect(org.owner_id).toBe('user-alice');

      // Verify membership calls
      const membershipCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('INSERT INTO') && call[0].includes('memberships') && call[1] && call[1].length >= 3
      );
      expect(membershipCalls.length).toBeGreaterThanOrEqual(3);

      // Verify roles (check the actual INSERT calls with data)
      const roles = membershipCalls.map(call => call[1].find((p: any) => ['owner', 'admin', 'member', 'viewer'].includes(p)));
      expect(roles).toContain('owner');
      expect(roles).toContain('admin');
      expect(roles).toContain('member');
    });

    it('should list all members of an organization', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      const mockMembers: TenantMembership[] = [
        {
          id: 'membership-1',
          tenant_id: 'org-acme',
          user_id: 'user-alice',
          role: 'owner',
          joined_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'membership-2',
          tenant_id: 'org-acme',
          user_id: 'user-bob',
          role: 'admin',
          joined_at: '2025-01-02T00:00:00Z',
        },
        {
          id: 'membership-3',
          tenant_id: 'org-acme',
          user_id: 'user-charlie',
          role: 'member',
          joined_at: '2025-01-03T00:00:00Z',
        },
      ];

      mockTenantPool.query.mockResolvedValueOnce({
        rows: mockMembers,
        rowCount: 3,
      });

      const members = await tenantStore.getMembers('org-acme');

      expect(members).toHaveLength(3);
      expect(members[0].role).toBe('owner');
      expect(members[1].role).toBe('admin');
      expect(members[2].role).toBe('member');
    });

    it('should update member role within organization', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      const mockUpdatedMembership: TenantMembership = {
        id: 'membership-2',
        tenant_id: 'org-acme',
        user_id: 'user-bob',
        role: 'admin', // upgraded from member
        joined_at: '2025-01-02T00:00:00Z',
      };

      mockTenantPool.query.mockResolvedValueOnce({
        rows: [mockUpdatedMembership],
        rowCount: 1,
      });

      const updated = await tenantStore.updateMember('org-acme', 'user-bob', {
        role: 'admin',
      });

      expect(updated.role).toBe('admin');

      // Verify UPDATE query was called
      const updateCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('UPDATE') && call[0].includes('memberships')
      );
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0][1]).toContain('admin');
    });

    it('should remove member from organization', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      mockTenantPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await tenantStore.removeMember('org-acme', 'user-charlie');

      // Verify DELETE query was called
      const deleteCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('DELETE FROM') && call[0].includes('memberships')
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][1]).toContain('org-acme');
      expect(deleteCalls[0][1]).toContain('user-charlie');
    });
  });

  describe('Tenant Switching', () => {
    it('should get all tenants for a user (personal + organizations)', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      const mockTenants: Tenant[] = [
        {
          id: 'tenant-alice',
          name: 'Alice Smith',
          type: 'user',
          owner_id: 'user-alice',
          metadata: { auto_created: true },
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'org-acme',
          name: 'Acme Corp',
          type: 'organization',
          owner_id: 'user-bob',
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
        {
          id: 'org-widgets',
          name: 'Widgets Inc',
          type: 'organization',
          owner_id: 'user-charlie',
          created_at: '2025-01-03T00:00:00Z',
          updated_at: '2025-01-03T00:00:00Z',
        },
      ];

      // Mock COUNT query first, then rows query
      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }], rowCount: 1 }) // COUNT query
        .mockResolvedValueOnce({ rows: mockTenants, rowCount: 3 }); // SELECT query

      const userTenants = await tenantStore.search({
        query: 'user-alice-memberships',
      });

      // User should have access to:
      // 1. Their personal tenant
      // 2. Organization(s) they're a member of
      expect(userTenants.tenants).toHaveLength(3);
      expect(userTenants.tenants.find(t => t.type === 'user')).toBeDefined();
      expect(userTenants.tenants.filter(t => t.type === 'organization')).toHaveLength(2);
    });

    it('should filter tenants by type', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      const mockOrganizations: Tenant[] = [
        {
          id: 'org-acme',
          name: 'Acme Corp',
          type: 'organization',
          owner_id: 'user-bob',
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
        {
          id: 'org-widgets',
          name: 'Widgets Inc',
          type: 'organization',
          owner_id: 'user-charlie',
          created_at: '2025-01-03T00:00:00Z',
          updated_at: '2025-01-03T00:00:00Z',
        },
      ];

      // Mock COUNT query first, then rows query
      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 }) // COUNT query
        .mockResolvedValueOnce({ rows: mockOrganizations, rowCount: 2 }); // SELECT query

      const result = await tenantStore.search({
        type: 'organization',
      });

      expect(result.tenants).toHaveLength(2);
      expect(result.tenants.every(t => t.type === 'organization')).toBe(true);

      // Verify query included type filter
      const searchCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('SELECT') && call[0].includes('tenants')
      );
      expect(searchCalls[0][0]).toContain('type');
    });
  });

  describe('Cross-Plugin Integration', () => {
    it('should handle user deletion cascading to tenant memberships', async () => {
      await tenantsPlugin.onStart({}, registry);
      await usersPlugin.onStart({}, registry);

      const userStore = postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      });

      mockUserPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await userStore.delete('user-alice');

      // Verify DELETE query was called
      const deleteCalls = mockUserPool.query.mock.calls.filter(call =>
        call[0].includes('DELETE FROM') && call[0].includes('users')
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][1]).toContain('user-alice');

      // Note: CASCADE delete of memberships would be handled by database
      // foreign key constraint: user_id REFERENCES users(id) ON DELETE CASCADE
    });

    it('should handle tenant deletion cascading to memberships', async () => {
      await tenantsPlugin.onStart({}, registry);

      const tenantStore = postgresTenantStore({
        pool: mockTenantPool as any,
        autoCreateTables: false,
      });

      mockTenantPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await tenantStore.delete('org-acme');

      // Verify DELETE query was called
      const deleteCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('DELETE FROM') && call[0].includes('tenants')
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][1]).toContain('org-acme');

      // Note: CASCADE delete of memberships would be handled by database
      // foreign key constraint: tenant_id REFERENCES tenants(id) ON DELETE CASCADE
    });
  });

  describe('Metadata and Configuration', () => {
    it('should store auto_created flag in tenant metadata', async () => {
      await tenantsPlugin.onStart({}, registry);
      await usersPlugin.onStart({}, registry);

      const mockUser: User = {
        id: 'user-test',
        email: 'test@example.com',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTenant: Tenant = {
        id: 'tenant-test',
        name: 'test@example.com',
        type: 'user',
        owner_id: 'user-test',
        metadata: { auto_created: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockMembership: TenantMembership = {
        id: 'membership-test',
        tenant_id: 'tenant-test',
        user_id: 'user-test',
        role: 'owner',
        joined_at: new Date().toISOString(),
      };

      mockUserPool.query
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      mockTenantPool.query
        .mockResolvedValueOnce({ rows: [mockTenant], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockMembership], rowCount: 1 });

      const userStore = postgresUserStore({
        pool: mockUserPool as any,
        autoCreateTables: false,
      });

      const user = await userStore.create({ email: 'test@example.com' });
      await tenantsPlugin.autoCreateUserTenant(user.id);

      // Verify metadata was passed to CREATE
      const tenantCalls = mockTenantPool.query.mock.calls.filter(call =>
        call[0].includes('INSERT INTO') && call[0].includes('tenants')
      );
      // Metadata is passed as JSON string, so check for string containing "auto_created"
      const metadataParam = tenantCalls[0][1].find(
        (param: any) => typeof param === 'string' && param.includes('auto_created')
      );
      expect(metadataParam).toBeDefined();
    });
  });
});
