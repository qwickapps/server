/**
 * Rate Limit Plugin Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RateLimitStore, RateLimitCache, CachedLimit, StoredLimit, IncrementOptions } from '../types.js';
import { RateLimitService } from '../rate-limit-service.js';
import { createSlidingWindowStrategy } from '../strategies/sliding-window.js';
import { createFixedWindowStrategy } from '../strategies/fixed-window.js';
import { createTokenBucketStrategy } from '../strategies/token-bucket.js';

// Mock store implementation
function createMockStore(): RateLimitStore {
  const records = new Map<string, StoredLimit>();

  return {
    name: 'mock',

    async initialize(): Promise<void> {
      // No-op
    },

    async get(key: string): Promise<StoredLimit | null> {
      return records.get(key) || null;
    },

    async increment(key: string, options: IncrementOptions): Promise<StoredLimit> {
      const now = new Date();
      const windowMs = options.windowMs;
      const windowStart = new Date(now.getTime() - (now.getTime() % windowMs));
      const windowEnd = new Date(windowStart.getTime() + windowMs);

      const existing = records.get(key);
      if (existing && existing.windowStart.getTime() === windowStart.getTime()) {
        existing.count += options.amount || 1;
        existing.updatedAt = now;
        return existing;
      }

      const newRecord: StoredLimit = {
        id: `mock-${Date.now()}`,
        key,
        count: options.amount || 1,
        maxRequests: options.maxRequests,
        windowMs: options.windowMs,
        windowStart,
        windowEnd,
        strategy: options.strategy,
        userId: options.userId,
        tenantId: options.tenantId,
        ipAddress: options.ipAddress,
        createdAt: now,
        updatedAt: now,
      };
      records.set(key, newRecord);
      return newRecord;
    },

    async clear(key: string): Promise<boolean> {
      return records.delete(key);
    },

    async cleanup(): Promise<number> {
      const now = Date.now();
      let deleted = 0;
      for (const [key, record] of records) {
        if (record.windowEnd.getTime() < now) {
          records.delete(key);
          deleted++;
        }
      }
      return deleted;
    },

    async shutdown(): Promise<void> {
      records.clear();
    },
  };
}

// Mock cache implementation
function createMockCache(): RateLimitCache {
  const cache = new Map<string, { value: CachedLimit; expiresAt: number }>();

  return {
    name: 'mock',

    async get(key: string): Promise<CachedLimit | null> {
      const entry = cache.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) {
        cache.delete(key);
        return null;
      }
      return entry.value;
    },

    async set(key: string, value: CachedLimit, ttlMs: number): Promise<void> {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    },

    async increment(key: string, amount = 1): Promise<number | null> {
      const entry = cache.get(key);
      if (!entry || entry.expiresAt <= Date.now()) return null;
      entry.value.count += amount;
      return entry.value.count;
    },

    async delete(key: string): Promise<boolean> {
      return cache.delete(key);
    },

    isAvailable(): boolean {
      return true;
    },

    async shutdown(): Promise<void> {
      cache.clear();
    },
  };
}

describe('RateLimitService', () => {
  let store: RateLimitStore;
  let cache: RateLimitCache;
  let service: RateLimitService;

  beforeEach(() => {
    store = createMockStore();
    cache = createMockCache();
    service = new RateLimitService({
      store,
      cache,
      defaults: {
        windowMs: 60000,
        maxRequests: 100,
        strategy: 'sliding-window',
      },
    });
  });

  afterEach(async () => {
    await store.shutdown();
    await cache.shutdown();
  });

  describe('checkLimit', () => {
    it('should return not limited for first request', async () => {
      const status = await service.checkLimit('test:key', { increment: false });

      expect(status.limited).toBe(false);
      expect(status.current).toBe(0);
      expect(status.limit).toBe(100);
      expect(status.remaining).toBe(100);
    });

    it('should use provided options over defaults', async () => {
      const status = await service.checkLimit('test:key', {
        maxRequests: 50,
        windowMs: 30000,
        increment: false,
      });

      expect(status.limit).toBe(50);
    });
  });

  describe('incrementLimit', () => {
    it('should increment the counter', async () => {
      const status1 = await service.incrementLimit('test:key');
      expect(status1.current).toBe(1);
      expect(status1.remaining).toBe(99);

      const status2 = await service.incrementLimit('test:key');
      expect(status2.current).toBe(2);
      expect(status2.remaining).toBe(98);
    });

    it('should return limited when max reached', async () => {
      // Set low limit for testing
      for (let i = 0; i < 5; i++) {
        await service.incrementLimit('test:key', { maxRequests: 5 });
      }

      const status = await service.incrementLimit('test:key', { maxRequests: 5 });
      expect(status.limited).toBe(true);
      expect(status.remaining).toBe(0);
    });
  });

  describe('isLimited', () => {
    it('should return false when not limited', async () => {
      const limited = await service.isLimited('test:key');
      expect(limited).toBe(false);
    });

    it('should return true when limited', async () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await service.incrementLimit('test:key', { maxRequests: 5 });
      }

      const limited = await service.isLimited('test:key', { maxRequests: 5 });
      expect(limited).toBe(true);
    });
  });

  describe('clearLimit', () => {
    it('should clear the limit', async () => {
      // Create some limits
      await service.incrementLimit('test:key');
      await service.incrementLimit('test:key');

      // Verify exists
      const beforeStatus = await service.checkLimit('test:key', { increment: false });
      expect(beforeStatus.current).toBeGreaterThan(0);

      // Clear
      await service.clearLimit('test:key');

      // Verify cleared
      const afterStatus = await service.checkLimit('test:key', { increment: false });
      expect(afterStatus.current).toBe(0);
    });
  });
});

describe('Strategies', () => {
  describe('Sliding Window', () => {
    it('should create strategy with correct name', () => {
      const strategy = createSlidingWindowStrategy();
      expect(strategy.name).toBe('sliding-window');
    });
  });

  describe('Fixed Window', () => {
    it('should create strategy with correct name', () => {
      const strategy = createFixedWindowStrategy();
      expect(strategy.name).toBe('fixed-window');
    });
  });

  describe('Token Bucket', () => {
    it('should create strategy with correct name', () => {
      const strategy = createTokenBucketStrategy();
      expect(strategy.name).toBe('token-bucket');
    });
  });
});

describe('Types', () => {
  it('should export all required types', async () => {
    // This test verifies that the types module compiles correctly
    const types = await import('../types.js');
    expect(types).toBeDefined();
  });
});
