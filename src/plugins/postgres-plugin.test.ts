/**
 * PostgreSQL Plugin Tests
 *
 * Note: These tests use mocks since we don't want to require a real database.
 * Integration tests should be run separately with a real PostgreSQL instance.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock pg before importing the plugin
vi.mock('pg', () => {
  const mockClient = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn(),
  };

  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockResolvedValue({ rows: [] }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    totalCount: 5,
    idleCount: 3,
    waitingCount: 0,
  };

  return {
    default: {
      Pool: vi.fn(() => mockPool),
    },
    Pool: vi.fn(() => mockPool),
  };
});

import {
  createPostgresPlugin,
  getPostgres,
  hasPostgres,
  type PostgresPluginConfig,
} from './postgres-plugin.js';
import type { PluginRegistry } from '../core/plugin-registry.js';

describe('PostgreSQL Plugin', () => {
  const mockConfig: PostgresPluginConfig = {
    url: 'postgresql://test:test@localhost:5432/testdb',
    maxConnections: 10,
    healthCheck: false, // Disable for unit tests
  };

  // Create a mock registry that matches the new Plugin interface
  const createMockRegistry = (): PluginRegistry => ({
    hasPlugin: vi.fn().mockReturnValue(false),
    getPlugin: vi.fn().mockReturnValue(null),
    listPlugins: vi.fn().mockReturnValue([]),
    addRoute: vi.fn(),
    addMenuItem: vi.fn(),
    addPage: vi.fn(),
    addWidget: vi.fn(),
    getRoutes: vi.fn().mockReturnValue([]),
    getMenuItems: vi.fn().mockReturnValue([]),
    getPages: vi.fn().mockReturnValue([]),
    getWidgets: vi.fn().mockReturnValue([]),
    getConfig: vi.fn().mockReturnValue({}),
    setConfig: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockReturnValue(() => {}),
    emit: vi.fn(),
    registerHealthCheck: vi.fn(),
    getApp: vi.fn().mockReturnValue({} as any),
    getRouter: vi.fn().mockReturnValue({} as any),
    getLogger: vi.fn().mockReturnValue({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  });

  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up any registered instances
    if (hasPostgres('test')) {
      const db = getPostgres('test');
      await db.close();
    }
  });

  describe('createPostgresPlugin', () => {
    it('should create a plugin with correct name', () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      expect(plugin.name).toBe('PostgreSQL (test)');
    });

    it('should use "default" as instance name when not specified', () => {
      const plugin = createPostgresPlugin(mockConfig);
      expect(plugin.name).toBe('PostgreSQL (default)');
    });

    it('should have correct plugin id', () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      expect(plugin.id).toBe('postgres:test');
    });
  });

  describe('onStart', () => {
    it('should register the postgres instance', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasPostgres('test')).toBe(true);
    });

    it('should log debug message on successful connection', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const logger = mockRegistry.getLogger('postgres:test');
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('connected')
      );
    });

    it('should register health check when enabled', async () => {
      const configWithHealth = { ...mockConfig, healthCheck: true };
      const plugin = createPostgresPlugin(configWithHealth, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'postgres',
          type: 'custom',
        })
      );
    });

    it('should use custom health check name when provided', async () => {
      const configWithCustomName = {
        ...mockConfig,
        healthCheck: true,
        healthCheckName: 'custom-db',
      };
      const plugin = createPostgresPlugin(configWithCustomName, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom-db',
        })
      );
    });
  });

  describe('getPostgres', () => {
    it('should return registered instance', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const db = getPostgres('test');
      expect(db).toBeDefined();
      expect(db.query).toBeDefined();
      expect(db.queryOne).toBeDefined();
      expect(db.transaction).toBeDefined();
    });

    it('should throw error for unregistered instance', () => {
      expect(() => getPostgres('nonexistent')).toThrow(
        'PostgreSQL instance "nonexistent" not found'
      );
    });
  });

  describe('hasPostgres', () => {
    it('should return false for unregistered instance', () => {
      expect(hasPostgres('nonexistent')).toBe(false);
    });

    it('should return true for registered instance', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasPostgres('test')).toBe(true);
    });
  });

  describe('PostgresInstance', () => {
    it('should execute query and return rows', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const db = getPostgres('test');
      const result = await db.query('SELECT 1');
      expect(result).toEqual([]);
    });

    it('should return null from queryOne when no rows', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const db = getPostgres('test');
      const result = await db.queryOne('SELECT 1');
      expect(result).toBeNull();
    });

    it('should return pool stats', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const db = getPostgres('test');
      const stats = db.getStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('idle');
      expect(stats).toHaveProperty('waiting');
    });
  });

  describe('onStop', () => {
    it('should close pool and unregister instance', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasPostgres('test')).toBe(true);

      await plugin.onStop();

      expect(hasPostgres('test')).toBe(false);
    });
  });
});
