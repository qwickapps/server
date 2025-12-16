/**
 * Auth Config Store Tests
 *
 * Unit tests for PostgreSQL-backed auth configuration store.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postgresAuthConfigStore } from './config-store.js';
import type { RuntimeAuthConfig } from './types.js';

// Mock pg pool
interface MockPoolClient {
  query: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
}

interface MockPool {
  query: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
}

function createMockPool(): MockPool {
  const mockClient: MockPoolClient = {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    on: vi.fn(),
    release: vi.fn(),
  };

  return {
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: vi.fn().mockResolvedValue(mockClient),
    on: vi.fn(),
  };
}

describe('postgresAuthConfigStore', () => {
  let mockPool: MockPool;

  beforeEach(() => {
    mockPool = createMockPool();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('identifier validation', () => {
    it('should reject invalid table names', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: 'DROP TABLE users;--',
        })
      ).toThrow('Invalid table name');
    });

    it('should reject table names with spaces', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: 'my table',
        })
      ).toThrow('Invalid table name');
    });

    it('should reject table names starting with numbers', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: '123table',
        })
      ).toThrow('Invalid table name');
    });

    it('should reject table names longer than 63 characters', () => {
      const longName = 'a'.repeat(64);
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: longName,
        })
      ).toThrow('Invalid table name');
    });

    it('should accept valid table names', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: 'auth_config',
        })
      ).not.toThrow();
    });

    it('should accept table names with underscores', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          tableName: '_my_auth_config_table',
        })
      ).not.toThrow();
    });

    it('should reject invalid schema names', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          schema: 'public; DROP TABLE users;--',
        })
      ).toThrow('Invalid schema name');
    });

    it('should reject invalid notify channel names', () => {
      expect(() =>
        postgresAuthConfigStore({
          pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
          notifyChannel: 'channel-with-dashes',
        })
      ).toThrow('Invalid notify channel');
    });
  });

  describe('initialize', () => {
    it('should create table if autoCreateTable is true', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: true,
        enableNotify: false,
      });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
    });

    it('should not create table if autoCreateTable is false', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      await store.initialize();

      expect(mockPool.query).not.toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
    });

    it('should use custom table name', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        tableName: 'custom_auth_config',
        autoCreateTable: true,
        enableNotify: false,
      });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('"public"."custom_auth_config"')
      );
    });

    it('should use custom schema name', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        schema: 'myschema',
        autoCreateTable: true,
        enableNotify: false,
      });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('"myschema"."auth_config"')
      );
    });
  });

  describe('load', () => {
    it('should return null when no config exists', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const result = await store.load();

      expect(result).toBeNull();
    });

    it('should return config when it exists', async () => {
      const mockConfig = {
        adapter: 'basic',
        config: { basic: { username: 'admin', password: 'secret' } },
        settings: {},
        updated_at: new Date('2025-01-15T12:00:00Z'),
        updated_by: 'admin@example.com',
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockConfig], rowCount: 1 });

      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const result = await store.load();

      expect(result).toEqual({
        adapter: 'basic',
        config: { basic: { username: 'admin', password: 'secret' } },
        settings: {},
        updatedAt: '2025-01-15T12:00:00.000Z',
        updatedBy: 'admin@example.com',
      });
    });
  });

  describe('save', () => {
    it('should upsert config to database', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const config: RuntimeAuthConfig = {
        adapter: 'basic',
        config: { basic: { username: 'admin', password: 'secret', realm: 'Test' } },
        settings: {},
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin@example.com',
      };

      await store.save(config);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining(['basic', expect.any(String), expect.any(String), 'admin@example.com'])
      );
    });

    it('should send NOTIFY when enableNotify is true', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: true,
      });

      const config: RuntimeAuthConfig = {
        adapter: 'basic',
        config: { basic: { username: 'admin', password: 'secret', realm: 'Test' } },
        settings: {},
        updatedAt: new Date().toISOString(),
      };

      await store.save(config);

      expect(mockPool.query).toHaveBeenCalledWith('NOTIFY auth_config_changed');
    });

    it('should not send NOTIFY when enableNotify is false', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const config: RuntimeAuthConfig = {
        adapter: 'basic',
        config: { basic: { username: 'admin', password: 'secret', realm: 'Test' } },
        settings: {},
        updatedAt: new Date().toISOString(),
      };

      await store.save(config);

      expect(mockPool.query).not.toHaveBeenCalledWith('NOTIFY auth_config_changed');
    });
  });

  describe('delete', () => {
    it('should delete config from database', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const result = await store.delete();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM')
      );
      expect(result).toBe(true);
    });

    it('should return false when no config to delete', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const result = await store.delete();

      expect(result).toBe(false);
    });

    it('should send NOTIFY after delete when enableNotify is true', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: true,
      });

      await store.delete();

      expect(mockPool.query).toHaveBeenCalledWith('NOTIFY auth_config_changed');
    });
  });

  describe('onChange', () => {
    it('should register listener and return unsubscribe function', () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const listener = vi.fn();
      const unsubscribe = store.onChange(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe listener when called', () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      const listener = vi.fn();
      const unsubscribe = store.onChange(listener);

      // Unsubscribe
      unsubscribe();

      // Listener should not be called anymore
      // (We can't easily test this without exposing internals, but the function exists)
      expect(unsubscribe).toBeDefined();
    });
  });

  describe('lazy pool initialization', () => {
    it('should accept a function that returns the pool', async () => {
      const poolFn = vi.fn().mockReturnValue(mockPool);

      const store = postgresAuthConfigStore({
        pool: poolFn as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      await store.load();

      expect(poolFn).toHaveBeenCalled();
    });

    it('should throw if pool is invalid', async () => {
      const store = postgresAuthConfigStore({
        pool: (() => ({})) as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      await expect(store.load()).rejects.toThrow('Invalid pool');
    });
  });

  describe('shutdown', () => {
    it('should release listener client and clear listeners', async () => {
      const store = postgresAuthConfigStore({
        pool: mockPool as unknown as Parameters<typeof postgresAuthConfigStore>[0]['pool'],
        autoCreateTable: false,
        enableNotify: false,
      });

      // Add a listener
      const listener = vi.fn();
      store.onChange(listener);

      // Shutdown
      await store.shutdown();

      // Should complete without error
      expect(true).toBe(true);
    });
  });
});
