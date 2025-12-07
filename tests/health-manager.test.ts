/**
 * Unit tests for HealthManager
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HealthManager } from '../src/core/health-manager.js';
import type { Logger, HealthCheck } from '../src/core/types.js';

// Mock logger
function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe('HealthManager', () => {
  let healthManager: HealthManager;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = createMockLogger();
    healthManager = new HealthManager(mockLogger);
  });

  afterEach(() => {
    healthManager.shutdown();
  });

  describe('register', () => {
    it('should register a health check', () => {
      const check: HealthCheck = {
        name: 'test-check',
        type: 'custom',
        check: async () => ({ healthy: true }),
      };

      healthManager.register(check);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Health check registered: test-check')
      );
    });

    it('should initialize result with a status', async () => {
      const check: HealthCheck = {
        name: 'test-check',
        type: 'custom',
        check: async () => ({ healthy: true }),
      };

      healthManager.register(check);

      // Wait for async check to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = healthManager.getResult('test-check');
      expect(result).toBeDefined();
      expect(result?.lastChecked).toBeInstanceOf(Date);
    });

    it('should use default interval of 30 seconds when not specified', () => {
      const check: HealthCheck = {
        name: 'test-check',
        type: 'custom',
        check: async () => ({ healthy: true }),
      };

      healthManager.register(check);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('30000ms')
      );
    });

    it('should use specified interval', () => {
      const check: HealthCheck = {
        name: 'test-check',
        type: 'custom',
        interval: 10000,
        check: async () => ({ healthy: true }),
      };

      healthManager.register(check);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('10000ms')
      );
    });
  });

  describe('custom health checks', () => {
    it('should run custom check and record healthy status', async () => {
      const check: HealthCheck = {
        name: 'custom-healthy',
        type: 'custom',
        check: async () => ({ healthy: true, latency: 50 }),
      };

      healthManager.register(check);

      // Wait for the check to complete
      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('custom-healthy');
      expect(result?.status).toBe('healthy');
      expect(result?.latency).toBe(50);
    });

    it('should run custom check and record unhealthy status', async () => {
      const check: HealthCheck = {
        name: 'custom-unhealthy',
        type: 'custom',
        check: async () => ({ healthy: false, details: { reason: 'test failure' } }),
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('custom-unhealthy');
      expect(result?.status).toBe('unhealthy');
      expect(result?.details).toEqual({ reason: 'test failure' });
    });

    it('should handle check timeout', async () => {
      const check: HealthCheck = {
        name: 'timeout-check',
        type: 'custom',
        timeout: 50, // Short timeout
        check: async () => {
          // Simulate a slow check that exceeds timeout
          await new Promise((resolve) => setTimeout(resolve, 200));
          return { healthy: true };
        },
      };

      healthManager.register(check);

      // Wait for timeout to trigger
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = healthManager.getResult('timeout-check');
      expect(result?.status).toBe('unhealthy');
      expect(result?.message).toBe('Timeout');
    });

    it('should handle check throwing an error', async () => {
      const check: HealthCheck = {
        name: 'error-check',
        type: 'custom',
        check: async () => {
          throw new Error('Something went wrong');
        },
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('error-check');
      expect(result?.status).toBe('unhealthy');
      expect(result?.message).toBe('Something went wrong');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle custom check without check function', async () => {
      const check: HealthCheck = {
        name: 'no-check-fn',
        type: 'custom',
        // No check function provided
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('no-check-fn');
      expect(result?.status).toBe('unhealthy');
      expect(result?.details).toEqual({ error: 'No check function provided' });
    });
  });

  describe('getResults', () => {
    it('should return all health check results', async () => {
      healthManager.register({
        name: 'check-1',
        type: 'custom',
        check: async () => ({ healthy: true }),
      });

      healthManager.register({
        name: 'check-2',
        type: 'custom',
        check: async () => ({ healthy: false }),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      const results = healthManager.getResults();
      expect(Object.keys(results)).toHaveLength(2);
      expect(results['check-1']).toBeDefined();
      expect(results['check-2']).toBeDefined();
    });
  });

  describe('getResult', () => {
    it('should return undefined for non-existent check', () => {
      const result = healthManager.getResult('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAggregatedStatus', () => {
    it('should return unknown when no checks registered', () => {
      const status = healthManager.getAggregatedStatus();
      expect(status).toBe('unknown');
    });

    it('should return healthy when all checks pass', async () => {
      healthManager.register({
        name: 'check-1',
        type: 'custom',
        check: async () => ({ healthy: true }),
      });

      healthManager.register({
        name: 'check-2',
        type: 'custom',
        check: async () => ({ healthy: true }),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      const status = healthManager.getAggregatedStatus();
      expect(status).toBe('healthy');
    });

    it('should return unhealthy when any check fails', async () => {
      healthManager.register({
        name: 'healthy-check',
        type: 'custom',
        check: async () => ({ healthy: true }),
      });

      healthManager.register({
        name: 'unhealthy-check',
        type: 'custom',
        check: async () => ({ healthy: false }),
      });

      await new Promise((resolve) => setTimeout(resolve, 20));

      const status = healthManager.getAggregatedStatus();
      expect(status).toBe('unhealthy');
    });
  });

  describe('checkAll', () => {
    it('should run all checks immediately', async () => {
      const checkFn1 = vi.fn().mockResolvedValue({ healthy: true });
      const checkFn2 = vi.fn().mockResolvedValue({ healthy: true });

      healthManager.register({
        name: 'check-1',
        type: 'custom',
        interval: 60000, // Long interval
        check: checkFn1,
      });

      healthManager.register({
        name: 'check-2',
        type: 'custom',
        interval: 60000,
        check: checkFn2,
      });

      // Initial registration runs checks once
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(checkFn1).toHaveBeenCalledTimes(1);
      expect(checkFn2).toHaveBeenCalledTimes(1);

      // Force run all checks again
      await healthManager.checkAll();

      expect(checkFn1).toHaveBeenCalledTimes(2);
      expect(checkFn2).toHaveBeenCalledTimes(2);
    });
  });

  describe('shutdown', () => {
    it('should clear all intervals', () => {
      healthManager.register({
        name: 'check-1',
        type: 'custom',
        check: async () => ({ healthy: true }),
      });

      healthManager.shutdown();

      expect(mockLogger.debug).toHaveBeenCalledWith('Health manager shutdown complete');
    });
  });

  describe('http health checks', () => {
    it('should return unhealthy when no URL provided', async () => {
      const check: HealthCheck = {
        name: 'http-no-url',
        type: 'http',
        // No url provided
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('http-no-url');
      expect(result?.status).toBe('unhealthy');
      expect(result?.details).toEqual({ error: 'No URL provided' });
    });
  });

  describe('tcp health checks', () => {
    it('should return unhealthy when host or port not provided', async () => {
      const check: HealthCheck = {
        name: 'tcp-no-host',
        type: 'tcp',
        // No host/port provided
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('tcp-no-host');
      expect(result?.status).toBe('unhealthy');
      expect(result?.details).toEqual({ error: 'Host and port required for TCP check' });
    });
  });

  describe('unknown check type', () => {
    it('should handle unknown check type', async () => {
      const check: HealthCheck = {
        name: 'unknown-type',
        type: 'unknown' as any, // Force an unknown type
      };

      healthManager.register(check);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = healthManager.getResult('unknown-type');
      expect(result?.status).toBe('unhealthy');
      expect(result?.details).toEqual({ error: 'Unknown check type' });
    });
  });
});
