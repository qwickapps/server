/**
 * Unit tests for Tenants PostgreSQL Store
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postgresTenantStore } from '../src/plugins/tenants/stores/postgres-store.js';
import type { CreateTenantInput, UpdateTenantInput, CreateTenantMembershipInput } from '../src/plugins/tenants/types.js';

// Mock pg pool
interface MockPgPool {
  query: ReturnType<typeof vi.fn>;
}

function createMockPool(): MockPgPool {
  return {
    query: vi.fn(),
  };
}

describe('Tenants PostgreSQL Store', () => {
  let mockPool: MockPgPool;

  beforeEach(() => {
    mockPool = createMockPool();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create tables and indexes when autoCreateTables is true', async () => {
      const store = postgresTenantStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS')
      );
    });

    it('should skip table creation when autoCreateTables is false', async () => {
      const store = postgresTenantStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await store.initialize();

      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should create tenant_memberships table with foreign key', async () => {
      const store = postgresTenantStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('REFERENCES')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON DELETE CASCADE')
      );
    });
  });

  describe('getById', () => {
    it('should return tenant when found', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Test Org',
        type: 'organization',
        owner_id: 'user-123',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockTenant], rowCount: 1 });

      const result = await store.getById('tenant-123');

      expect(result).toEqual(mockTenant);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM'),
        ['tenant-123']
      );
    });

    it('should return null when tenant not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getByIds', () => {
    it('should return multiple tenants', async () => {
      const mockTenants = [
        { id: 'tenant-1', name: 'Org 1', type: 'organization', owner_id: 'user-1' },
        { id: 'tenant-2', name: 'Org 2', type: 'organization', owner_id: 'user-2' },
      ];

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: mockTenants, rowCount: 2 });

      const result = await store.getByIds(['tenant-1', 'tenant-2']);

      expect(result).toEqual(mockTenants);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ANY'),
        [['tenant-1', 'tenant-2']]
      );
    });

    it('should return empty array for empty input', async () => {
      const store = postgresTenantStore({ pool: mockPool });

      const result = await store.getByIds([]);

      expect(result).toEqual([]);
      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

  describe('getByName', () => {
    it('should find tenant by name case-insensitively', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Test Org',
        type: 'organization',
        owner_id: 'user-123',
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockTenant], rowCount: 1 });

      const result = await store.getByName('test org');

      expect(result).toEqual(mockTenant);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(name) = LOWER'),
        ['test org']
      );
    });
  });

  describe('create', () => {
    it('should create tenant and auto-add owner as member', async () => {
      const input: CreateTenantInput = {
        name: 'New Org',
        type: 'organization',
        owner_id: 'user-123',
        metadata: { industry: 'tech' },
      };

      const mockTenant = {
        id: 'tenant-new',
        ...input,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockMembership = {
        id: 'membership-1',
        tenant_id: 'tenant-new',
        user_id: 'user-123',
        role: 'owner',
        joined_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });

      // First call: create tenant
      // Second call: create membership
      mockPool.query
        .mockResolvedValueOnce({ rows: [mockTenant], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockMembership], rowCount: 1 });

      const result = await store.create(input);

      expect(result).toEqual(mockTenant);

      // Verify tenant creation
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining(['New Org', 'organization', 'user-123'])
      );

      // Verify owner membership creation
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining(['tenant-new', 'user-123', 'owner'])
      );
    });

    it('should handle metadata correctly', async () => {
      const input: CreateTenantInput = {
        name: 'Org with Metadata',
        type: 'organization',
        owner_id: 'user-123',
        metadata: { plan: 'premium', seats: 50 },
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [{ id: 'tenant-1' }], rowCount: 1 });

      await store.create(input);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([JSON.stringify(input.metadata)])
      );
    });
  });

  describe('update', () => {
    it('should update tenant name and metadata', async () => {
      const input: UpdateTenantInput = {
        name: 'Updated Name',
        metadata: { updated: true },
      };

      const mockUpdated = {
        id: 'tenant-123',
        name: 'Updated Name',
        type: 'organization',
        owner_id: 'user-123',
        metadata: { updated: true },
        created_at: new Date(),
        updated_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockUpdated], rowCount: 1 });

      const result = await store.update('tenant-123', input);

      expect(result).toEqual(mockUpdated);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.anything()
      );
    });

    it('should return existing tenant when no updates provided', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Test Org',
        type: 'organization',
        owner_id: 'user-123',
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockTenant], rowCount: 1 });

      const result = await store.update('tenant-123', {});

      expect(result).toEqual(mockTenant);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM'),
        ['tenant-123']
      );
    });

    it('should return null when tenant not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.update('nonexistent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete tenant and return true', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 1 });

      const result = await store.delete('tenant-123');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM'),
        ['tenant-123']
      );
    });

    it('should return false when tenant not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    it('should search tenants with pagination', async () => {
      const mockTenants = [
        { id: 'tenant-1', name: 'Org 1', type: 'organization' },
        { id: 'tenant-2', name: 'Org 2', type: 'organization' },
      ];

      const store = postgresTenantStore({ pool: mockPool });

      // First call: count
      // Second call: results
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockTenants, rowCount: 2 });

      const result = await store.search({
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        tenants: mockTenants,
        total: 10,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by tenant type', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await store.search({ type: 'organization' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('type ='),
        expect.arrayContaining(['organization'])
      );
    });

    it('should filter by owner_id', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await store.search({ owner_id: 'user-123' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('owner_id ='),
        expect.arrayContaining(['user-123'])
      );
    });

    it('should search by name query', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await store.search({ query: 'acme' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%acme%'])
      );
    });

    it('should support custom sorting', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await store.search({
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY name ASC'),
        expect.anything()
      );
    });
  });

  describe('getTenantsForUser', () => {
    it('should return tenants with user membership info', async () => {
      const mockRows = [
        {
          id: 'tenant-1',
          name: 'Personal Tenant',
          type: 'user',
          owner_id: 'user-123',
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
          user_role: 'owner',
          tenant_id: 'tenant-1',
          user_id: 'user-123',
          role: 'owner',
          joined_at: new Date(),
        },
      ];

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: mockRows, rowCount: 1 });

      const result = await store.getTenantsForUser('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('user_role', 'owner');
      expect(result[0]).toHaveProperty('membership');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('JOIN'),
        ['user-123']
      );
    });
  });

  describe('addMember', () => {
    it('should add member to tenant', async () => {
      const input: CreateTenantMembershipInput = {
        tenant_id: 'tenant-123',
        user_id: 'user-456',
        role: 'member',
      };

      const mockMembership = {
        id: 'membership-1',
        ...input,
        joined_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockMembership], rowCount: 1 });

      const result = await store.addMember(input);

      expect(result).toEqual(mockMembership);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        ['tenant-123', 'user-456', 'member']
      );
    });

    it('should use UPSERT to update existing membership', async () => {
      const input: CreateTenantMembershipInput = {
        tenant_id: 'tenant-123',
        user_id: 'user-456',
        role: 'admin',
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [{ id: 'membership-1' }], rowCount: 1 });

      await store.addMember(input);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (tenant_id, user_id) DO UPDATE'),
        expect.anything()
      );
    });
  });

  describe('updateMember', () => {
    it('should update member role', async () => {
      const mockMembership = {
        id: 'membership-1',
        tenant_id: 'tenant-123',
        user_id: 'user-456',
        role: 'admin',
        joined_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockMembership], rowCount: 1 });

      const result = await store.updateMember('tenant-123', 'user-456', { role: 'admin' });

      expect(result).toEqual(mockMembership);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        ['admin', 'tenant-123', 'user-456']
      );
    });

    it('should return null when membership not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.updateMember('tenant-123', 'user-456', { role: 'admin' });

      expect(result).toBeNull();
    });
  });

  describe('removeMember', () => {
    it('should remove member from tenant', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 1 });

      const result = await store.removeMember('tenant-123', 'user-456');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM'),
        ['tenant-123', 'user-456']
      );
    });

    it('should return false when membership not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.removeMember('tenant-123', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('getMembers', () => {
    it('should return all members of a tenant', async () => {
      const mockMembers = [
        { id: 'm-1', tenant_id: 'tenant-123', user_id: 'user-1', role: 'owner', joined_at: new Date() },
        { id: 'm-2', tenant_id: 'tenant-123', user_id: 'user-2', role: 'admin', joined_at: new Date() },
        { id: 'm-3', tenant_id: 'tenant-123', user_id: 'user-3', role: 'member', joined_at: new Date() },
      ];

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: mockMembers, rowCount: 3 });

      const result = await store.getMembers('tenant-123');

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockMembers);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY joined_at ASC'),
        ['tenant-123']
      );
    });
  });

  describe('getMembership', () => {
    it('should return specific membership', async () => {
      const mockMembership = {
        id: 'membership-1',
        tenant_id: 'tenant-123',
        user_id: 'user-456',
        role: 'member',
        joined_at: new Date(),
      };

      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [mockMembership], rowCount: 1 });

      const result = await store.getMembership('tenant-123', 'user-456');

      expect(result).toEqual(mockMembership);
    });

    it('should return null when membership not found', async () => {
      const store = postgresTenantStore({ pool: mockPool });
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.getMembership('tenant-123', 'user-456');

      expect(result).toBeNull();
    });
  });

  describe('custom configuration', () => {
    it('should use custom table names', async () => {
      const store = postgresTenantStore({
        pool: mockPool,
        tenantsTable: 'custom_tenants',
        membershipsTable: 'custom_memberships',
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('custom_tenants')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('custom_memberships')
      );
    });

    it('should use custom schema', async () => {
      const store = postgresTenantStore({
        pool: mockPool,
        schema: 'custom_schema',
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('"custom_schema"')
      );
    });

    it('should support lazy pool initialization', async () => {
      const lazyPool = vi.fn().mockReturnValue(mockPool);

      const store = postgresTenantStore({
        pool: lazyPool,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getById('tenant-123');

      expect(lazyPool).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalled();
    });
  });
});
