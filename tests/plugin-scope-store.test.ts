/**
 * Unit tests for Plugin Scope Store
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPostgresPluginScopeStore } from '../src/plugins/api-keys/stores/plugin-scope-store.js';
import type { PluginScope } from '../src/plugins/api-keys/stores/plugin-scope-store.js';

// Mock pg client
interface MockPgClient {
  query: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
}

interface MockPgPool {
  query: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
}

function createMockPool(): MockPgPool {
  const mockClient: MockPgClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  return {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue(mockClient),
  };
}

describe('Plugin Scope Store', () => {
  let mockPool: MockPgPool;
  let mockClient: MockPgClient;

  beforeEach(() => {
    mockPool = createMockPool();
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    (mockPool.connect as any).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create table with CHECK constraint when autoCreateTables is true', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "public"."plugin_scopes"')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CHECK (name ~ \'^[a-z0-9-]+:[a-z0-9-]+$\')')
      );
    });

    it('should create indexes on name and plugin_id', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_plugin_scopes_name ON "public"."plugin_scopes"')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_plugin_scopes_plugin_id ON "public"."plugin_scopes"')
      );
    });

    it('should seed system scopes (read, write, admin)', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "public"."plugin_scopes"')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("('system', 'system:read'")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("('system', 'system:write'")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("('system', 'system:admin'")
      );
    });

    it('should skip table creation when autoCreateTables is false', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await store.initialize();

      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

  describe('registerScopes', () => {
    it('should insert new scopes for a plugin', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const scopes: PluginScope[] = [
        {
          name: 'qwickbrain:read',
          description: 'Read access to QwickBrain',
          category: 'read',
        },
        {
          name: 'qwickbrain:execute',
          description: 'Execute QwickBrain tools',
          category: 'write',
        },
      ];

      mockClient.query.mockResolvedValue({ rows: [], rowCount: 2 });
      mockPool.query.mockResolvedValue({
        rows: scopes.map(scope => ({ ...scope, plugin_id: 'qwickbrain' })),
        rowCount: scopes.length,
      });

      await store.registerScopes('qwickbrain', scopes);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "public"."plugin_scopes"'),
        ['qwickbrain', 'qwickbrain:read', 'Read access to QwickBrain', 'read']
      );
    });

    it('should update cache after registering scopes', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const scopes: PluginScope[] = [
        {
          name: 'test:action',
          description: 'Test action',
        },
      ];

      mockClient.query.mockResolvedValue({ rows: [], rowCount: 1 });
      mockPool.query.mockResolvedValue({
        rows: [{ name: 'test:action', plugin_id: 'test', description: 'Test action', category: null }],
        rowCount: 1,
      });

      await store.registerScopes('test', scopes);

      // Verify the refreshed cache serves validation without another query.
      const isValid = await store.isValidScope('test:action');
      expect(isValid).toBe(true);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle upsert conflicts (ON CONFLICT DO UPDATE)', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const scopes: PluginScope[] = [
        {
          name: 'existing:scope',
          description: 'Updated description',
        },
      ];

      mockClient.query.mockResolvedValue({ rows: [], rowCount: 1 });
      mockPool.query.mockResolvedValue({
        rows: [{ name: 'existing:scope', plugin_id: 'existing', description: 'Updated description', category: null }],
        rowCount: 1,
      });

      await store.registerScopes('existing', scopes);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (name) DO UPDATE'),
        ['existing', 'existing:scope', 'Updated description', null]
      );
    });
  });

  describe('getAllScopes', () => {
    it('should return all registered scopes', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockScopes = [
        {
          name: 'system:read',
          plugin_id: 'system',
          description: 'System read access',
          category: 'read',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'qwickbrain:execute',
          plugin_id: 'qwickbrain',
          description: 'Execute QwickBrain tools',
          category: 'write',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockScopes, rowCount: 2 });

      const result = await store.getAllScopes();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('system:read');
      expect(result[1].name).toBe('qwickbrain:execute');
    });

    it('should query the database on subsequent calls', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockScopes = [
        {
          name: 'test:scope',
          plugin_id: 'test',
          description: 'Test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockScopes, rowCount: 1 });

      // First call - loads from DB
      await store.getAllScopes();
      expect(mockPool.query).toHaveBeenCalledTimes(1);

      // Public reads query the database each time.
      await store.getAllScopes();
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('isValidScope', () => {
    it('should return true for registered scopes', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({
        rows: [{ name: 'qwickbrain:read' }],
        rowCount: 1,
      });

      const isValid = await store.isValidScope('qwickbrain:read');
      expect(isValid).toBe(true);
    });

    it('should return false for unregistered scopes', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const isValid = await store.isValidScope('unknown:scope');
      expect(isValid).toBe(false);
    });

    it('should use cache after first load', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({
        rows: [{ name: 'test:scope', plugin_id: 'test', description: 'Test' }],
        rowCount: 1,
      });

      // First validation loads all scopes into cache.
      const isValid = await store.isValidScope('test:scope');
      expect(isValid).toBe(true);

      // Subsequent validation uses the populated cache.
      await store.isValidScope('test:scope');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPluginScopes', () => {
    it('should return scopes for a specific plugin', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockScopes = [
        {
          name: 'qwickbrain:read',
          plugin_id: 'qwickbrain',
          description: 'Read access',
          category: 'read',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'qwickbrain:execute',
          plugin_id: 'qwickbrain',
          description: 'Execute tools',
          category: 'write',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockScopes, rowCount: 2 });

      const result = await store.getPluginScopes('qwickbrain');

      expect(result).toHaveLength(2);
      expect(result[0].plugin_id).toBe('qwickbrain');
      expect(result[1].plugin_id).toBe('qwickbrain');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE plugin_id = $1'),
        ['qwickbrain']
      );
    });

    it('should return empty array for plugin with no scopes', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.getPluginScopes('unknown');

      expect(result).toHaveLength(0);
    });
  });

  describe('shutdown', () => {
    it('should clear the cache on shutdown', async () => {
      const store = createPostgresPluginScopeStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      // Load cache
      mockPool.query.mockResolvedValue({
        rows: [{ name: 'test:scope', plugin_id: 'test', description: 'Test' }],
        rowCount: 1,
      });
      await store.getAllScopes();

      // Shutdown
      await store.shutdown();

      // After shutdown, next call should query DB again (cache cleared)
      mockPool.query.mockClear();
      mockPool.query.mockResolvedValue({
        rows: [{ name: 'test:scope', plugin_id: 'test', description: 'Test' }],
        rowCount: 1,
      });

      await store.getAllScopes();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });
});
