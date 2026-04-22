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
  parseConnectionUrl,
  sanitizeConnectionUrl,
  isManagedDatabase,
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
    addConfigComponent: vi.fn(),
    getRoutes: vi.fn().mockReturnValue([]),
    getMenuItems: vi.fn().mockReturnValue([]),
    getPages: vi.fn().mockReturnValue([]),
    getWidgets: vi.fn().mockReturnValue([]),
    getConfigComponents: vi.fn().mockReturnValue([]),
    getPluginContributions: vi.fn().mockReturnValue({ routes: [], menuItems: [], pages: [], widgets: [], config: undefined }),
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

    it('should log info message on successful connection', async () => {
      const plugin = createPostgresPlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const logger = mockRegistry.getLogger('postgres:test');
      expect(logger.info).toHaveBeenCalledWith(
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

  describe('parseConnectionUrl', () => {
    it('should parse a standard URL with explicit port', () => {
      const result = parseConnectionUrl('postgresql://myuser:mypass@localhost:5432/mydb');
      expect(result).toEqual({ user: 'myuser', password: 'mypass', host: 'localhost', port: 5432, database: 'mydb' });
    });

    it('should default port to 5432 when omitted (Neon URL)', () => {
      const result = parseConnectionUrl('postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require');
      expect(result.host).toBe('ep-xxx.us-east-2.aws.neon.tech');
      expect(result.port).toBe(5432);
      expect(result.database).toBe('neondb');
      expect(result.user).toBe('user');
    });

    it('should parse a Supabase URL without port', () => {
      const result = parseConnectionUrl('postgresql://user:pass@db.abc123.supabase.co/postgres');
      expect(result.host).toBe('db.abc123.supabase.co');
      expect(result.port).toBe(5432);
      expect(result.database).toBe('postgres');
    });

    it('should normalise postgres:// scheme to postgresql://', () => {
      const result = parseConnectionUrl('postgres://user:pass@localhost:5432/testdb');
      expect(result.host).toBe('localhost');
      expect(result.database).toBe('testdb');
    });

    it('should strip query-string params from the database name', () => {
      const result = parseConnectionUrl('postgresql://user:pass@host.neon.tech/mydb?sslmode=require&connect_timeout=10');
      expect(result.database).toBe('mydb');
    });

    it('should decode percent-encoded characters in password', () => {
      const result = parseConnectionUrl('postgresql://user:pass%40word@ep-xxx.neon.tech/mydb?sslmode=require');
      expect(result.user).toBe('user');
      expect(result.password).toBe('pass@word');
      expect(result.host).toBe('ep-xxx.neon.tech');
      expect(result.database).toBe('mydb');
    });

    it('should handle empty password without throwing', () => {
      const result = parseConnectionUrl('postgresql://user:@localhost:5432/mydb');
      expect(result.user).toBe('user');
      expect(result.password).toBe('');
      expect(result.host).toBe('localhost');
      expect(result.port).toBe(5432);
      expect(result.database).toBe('mydb');
    });

    it('should throw on an invalid URL', () => {
      expect(() => parseConnectionUrl('not-a-url')).toThrow('Invalid PostgreSQL connection URL format');
    });
  });

  describe('isManagedDatabase', () => {
    it('should return true for *.neon.tech hosts', () => {
      expect(isManagedDatabase('ep-xxx.us-east-2.aws.neon.tech')).toBe(true);
    });

    it('should return true for *.supabase.co hosts', () => {
      expect(isManagedDatabase('db.abc123.supabase.co')).toBe(true);
    });

    it('should return false for localhost', () => {
      expect(isManagedDatabase('localhost')).toBe(false);
    });

    it('should return false for RDS hosts', () => {
      expect(isManagedDatabase('mydb.cluster-xyz.us-east-1.rds.amazonaws.com')).toBe(false);
    });

    it('should return false for a domain that merely contains but does not end with neon.tech', () => {
      expect(isManagedDatabase('neon.tech.example.com')).toBe(false);
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

  describe('sanitizeConnectionUrl', () => {
    it('should strip channel_binding=require from a Neon pooler URL', () => {
      const raw = 'postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
      const sanitized = sanitizeConnectionUrl(raw);
      expect(sanitized).not.toContain('channel_binding');
      expect(sanitized).toContain('sslmode=require');
    });

    it('should return the URL unchanged when channel_binding is absent', () => {
      const raw = 'postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require';
      expect(sanitizeConnectionUrl(raw)).toBe(raw);
    });

    it('should preserve the postgres:// scheme', () => {
      const raw = 'postgres://user:pass@ep-xxx-pooler.neon.tech/neondb?channel_binding=require';
      const sanitized = sanitizeConnectionUrl(raw);
      expect(sanitized.startsWith('postgres://')).toBe(true);
      expect(sanitized).not.toContain('channel_binding');
    });

    it('should return the input unchanged for a non-URL string', () => {
      const raw = 'not-a-url';
      expect(sanitizeConnectionUrl(raw)).toBe(raw);
    });

    it('should handle a URL with only channel_binding in the query string', () => {
      const raw = 'postgresql://user:pass@host/db?channel_binding=require';
      const sanitized = sanitizeConnectionUrl(raw);
      expect(sanitized).not.toContain('channel_binding');
      // No trailing '?' when the query string becomes empty
      expect(sanitized).not.toMatch(/\?$/);
    });

    it('should be a no-op on an empty string', () => {
      expect(sanitizeConnectionUrl('')).toBe('');
    });
  });

  describe('healthCheckUrl option', () => {
    it('should create a separate pool when healthCheckUrl is provided', async () => {
      const pg = await import('pg');
      const PoolMock = vi.mocked(pg.default.Pool);
      PoolMock.mockClear();

      const configWithHealthUrl = {
        ...mockConfig,
        healthCheck: true,
        healthCheckUrl: 'postgresql://user:pass@ep-direct.neon.tech/db',
      };

      const plugin = createPostgresPlugin(configWithHealthUrl, 'test');
      await plugin.onStart({}, mockRegistry);

      // Pool should have been constructed at least twice: once for the main
      // pool and once for the dedicated health-check pool.
      expect(PoolMock.mock.calls.length).toBeGreaterThanOrEqual(2);

      const poolArgs = PoolMock.mock.calls.map((c) => c[0] as Record<string, unknown>);
      const healthPoolArgs = poolArgs.find(
        (a) => a && (a['connectionString'] as string | undefined)?.includes('ep-direct.neon.tech')
      );
      expect(healthPoolArgs).toBeDefined();
      // Health-check pool should be minimal (max: 1)
      expect(healthPoolArgs!['max']).toBe(1);
    });

    it('should strip channel_binding from healthCheckUrl', async () => {
      const pg = await import('pg');
      const PoolMock = vi.mocked(pg.default.Pool);
      PoolMock.mockClear();

      const configWithHealthUrl = {
        ...mockConfig,
        healthCheck: true,
        healthCheckUrl: 'postgresql://user:pass@ep-direct.neon.tech/db?channel_binding=require',
      };

      const plugin = createPostgresPlugin(configWithHealthUrl, 'test');
      await plugin.onStart({}, mockRegistry);

      const poolArgs = PoolMock.mock.calls.map((c) => c[0] as Record<string, unknown>);
      const healthPoolArgs = poolArgs.find(
        (a) => a && (a['connectionString'] as string | undefined)?.includes('ep-direct.neon.tech')
      );
      expect(healthPoolArgs).toBeDefined();
      expect(healthPoolArgs!['connectionString']).not.toContain('channel_binding');
    });
  });
});
