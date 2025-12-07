/**
 * Cache Plugin Tests
 *
 * Note: These tests use mocks since we don't want to require a real Redis instance.
 * Integration tests should be run separately with a real Redis instance.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ioredis before importing the plugin
vi.mock('ioredis', () => {
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

describe('Cache Plugin', () => {
  const mockConfig: CachePluginConfig = {
    url: 'redis://localhost:6379',
    keyPrefix: 'test:',
    defaultTtl: 3600,
    healthCheck: false, // Disable for unit tests
  };

  const mockContext = {
    config: { productName: 'Test', port: 3000 },
    app: {} as any,
    router: {} as any,
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    registerHealthCheck: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(plugin.name).toBe('cache:test');
    });

    it('should use "default" as instance name when not specified', () => {
      const plugin = createCachePlugin(mockConfig);
      expect(plugin.name).toBe('cache:default');
    });

    it('should have low order number (initialize early)', () => {
      const plugin = createCachePlugin(mockConfig);
      expect(plugin.order).toBeLessThan(10);
    });
  });

  describe('onInit', () => {
    it('should register the cache instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      expect(hasCache('test')).toBe(true);
    });

    it('should log debug message on successful connection', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      expect(mockContext.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('connected')
      );
    });

    it('should register health check when enabled', async () => {
      const configWithHealth = { ...mockConfig, healthCheck: true };
      const plugin = createCachePlugin(configWithHealth, 'test');
      await plugin.onInit?.(mockContext as any);

      expect(mockContext.registerHealthCheck).toHaveBeenCalledWith(
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
      await plugin.onInit?.(mockContext as any);

      expect(mockContext.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom-cache',
        })
      );
    });
  });

  describe('getCache', () => {
    it('should return registered instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

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
      await plugin.onInit?.(mockContext as any);

      expect(hasCache('test')).toBe(true);
    });
  });

  describe('CacheInstance', () => {
    it('should get value and parse JSON', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      // Mock will return null by default
      const result = await cache.get('key');
      expect(result).toBeNull();
    });

    it('should set value with JSON stringification', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      await cache.set('key', { foo: 'bar' }, 3600);
      // Just verify it doesn't throw
    });

    it('should return cache stats', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      const stats = await cache.getStats();
      expect(stats).toHaveProperty('connected');
      expect(stats).toHaveProperty('keyCount');
    });

    it('should check if key exists', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      const exists = await cache.exists('key');
      expect(typeof exists).toBe('boolean');
    });

    it('should get TTL for a key', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      const ttl = await cache.ttl('key');
      expect(typeof ttl).toBe('number');
    });

    it('should increment a value', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      const cache = getCache('test');
      const value = await cache.incr('counter');
      expect(typeof value).toBe('number');
    });
  });

  describe('onShutdown', () => {
    it('should close client and unregister instance', async () => {
      const plugin = createCachePlugin(mockConfig, 'test');
      await plugin.onInit?.(mockContext as any);

      expect(hasCache('test')).toBe(true);

      await plugin.onShutdown?.();

      expect(hasCache('test')).toBe(false);
    });
  });
});
