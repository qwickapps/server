/**
 * Cache Plugin Tests
 *
 * Note: These tests use mocks since we don't want to require a real Redis instance.
 * Integration tests should be run separately with a real Redis instance.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ioredis before importing the plugin
vi.mock('ioredis', () => {
  // Create a mock stream that emits keys in batches
  const createMockScanStream = (keys: string[]) => {
    const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
    return {
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
        // Simulate async emission after all handlers are registered
        if (event === 'error') {
          setTimeout(() => {
            // Emit data in batches
            handlers['data']?.forEach(h => h(keys));
            // Then emit end
            handlers['end']?.forEach(h => h());
          }, 0);
        }
        return { on: vi.fn() };
      }),
    };
  };

  const mockClient = {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    exists: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(3600),
    incr: vi.fn().mockResolvedValue(1),
    incrby: vi.fn().mockResolvedValue(5),
    keys: vi.fn().mockResolvedValue([]),
    scanStream: vi.fn(() => createMockScanStream(['test:key1', 'test:key2', 'test:key3'])),
    info: vi.fn().mockResolvedValue('used_memory_human:1.5M\n'),
    dbsize: vi.fn().mockResolvedValue(100),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
    on: vi.fn(),
    status: 'ready',
  };

  return {
    default: vi.fn(() => mockClient),
  };
});

import {
  createCachePlugin,
  getCache,
  hasCache,
  type CachePluginConfig,
} from './cache-plugin.js';
import type { PluginRegistry } from '../core/plugin-registry.js';

describe('Cache Plugin', () => {
  const mockConfig: CachePluginConfig = {
    url: 'redis://localhost:6379',
    keyPrefix: 'test:',
    defaultTtl: 3600,
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
    if (hasCache('test')) {
      const cache = getCache('test');
      await cache.close();
    }
  });

  describe('createCachePlugin', () => {
    it('should create a plugin with correct name', () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      expect(plugin.name).toBe('Redis Cache (test)');
    });

    it('should use "default" as instance name when not specified', () => {
      const plugin = createCachePlugin(mockConfig);
      expect(plugin.name).toBe('Redis Cache (default)');
    });

    it('should have correct plugin id', () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      expect(plugin.id).toBe('cache:test');
    });
  });

  describe('onStart', () => {
    it('should register the cache instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasCache('test')).toBe(true);
    });

    it('should log debug message on successful connection', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const logger = mockRegistry.getLogger('cache:test');
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('connected')
      );
    });

    it('should register health check when enabled', async () => {
      const configWithHealth = { ...mockConfig, healthCheck: true };
      const plugin = createCachePlugin(configWithHealth, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'redis',
          type: 'custom',
        })
      );
    });

    it('should use custom health check name when provided', async () => {
      const configWithCustomName = {
        ...mockConfig,
        healthCheck: true,
        healthCheckName: 'custom-cache',
      };
      const plugin = createCachePlugin(configWithCustomName, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom-cache',
        })
      );
    });
  });

  describe('getCache', () => {
    it('should return registered instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      expect(cache).toBeDefined();
      expect(cache.get).toBeDefined();
      expect(cache.set).toBeDefined();
      expect(cache.delete).toBeDefined();
    });

    it('should throw error for unregistered instance', () => {
      expect(() => getCache('nonexistent')).toThrow(
        'Cache instance "nonexistent" not found'
      );
    });
  });

  describe('hasCache', () => {
    it('should return false for unregistered instance', () => {
      expect(hasCache('nonexistent')).toBe(false);
    });

    it('should return true for registered instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasCache('test')).toBe(true);
    });
  });

  describe('CacheInstance', () => {
    it('should get value and parse JSON', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      // Mock will return null by default
      const result = await cache.get('key');
      expect(result).toBeNull();
    });

    it('should set value with JSON stringification', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      await cache.set('key', { foo: 'bar' }, 3600);
      // Just verify it doesn't throw
    });

    it('should return cache stats', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const stats = await cache.getStats();
      expect(stats).toHaveProperty('connected');
      expect(stats).toHaveProperty('keyCount');
    });

    it('should check if key exists', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const exists = await cache.exists('key');
      expect(typeof exists).toBe('boolean');
    });

    it('should get TTL for a key', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const ttl = await cache.ttl('key');
      expect(typeof ttl).toBe('number');
    });

    it('should increment a value', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const value = await cache.incr('counter');
      expect(typeof value).toBe('number');
    });

    it('should scan keys using cursor-based iteration', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const keys = await cache.scanKeys('*');

      // Mock returns ['test:key1', 'test:key2', 'test:key3']
      // After prefix removal, should be ['key1', 'key2', 'key3']
      expect(Array.isArray(keys)).toBe(true);
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should pass count option to scanStream', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      const cache = getCache('test');
      const client = cache.getClient();

      await cache.scanKeys('*', { count: 500 });

      expect(client.scanStream).toHaveBeenCalledWith({
        match: 'test:*',
        count: 500,
      });
    });
  });

  describe('onStop', () => {
    it('should close client and unregister instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onStart({}, mockRegistry);

      expect(hasCache('test')).toBe(true);

      await plugin.onStop();

      expect(hasCache('test')).toBe(false);
    });
  });
});
