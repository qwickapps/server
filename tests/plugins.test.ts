/**
 * Unit tests for Plugins
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PluginContext, Logger } from '../src/core/types.js';

// Mock logger
function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

// Mock Express Response
function createMockResponse() {
  const res: any = {
    json: vi.fn(),
    status: vi.fn(() => res),
    send: vi.fn(),
  };
  return res;
}

// Mock Express Request
function createMockRequest(overrides: any = {}) {
  return {
    query: {},
    params: {},
    body: {},
    ...overrides,
  };
}

describe('Health Plugin', () => {
  let mockLogger: Logger;
  let mockRegisterHealthCheck: ReturnType<typeof vi.fn>;
  let mockContext: PluginContext;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRegisterHealthCheck = vi.fn();
    mockContext = {
      config: {
        productName: 'Test',
        port: 3000,
      },
      app: {} as any,
      router: {} as any,
      logger: mockLogger,
      registerHealthCheck: mockRegisterHealthCheck,
    };
  });

  it('should create a health plugin with correct name and order', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const plugin = createHealthPlugin({
      checks: [],
    });

    expect(plugin.name).toBe('health');
    expect(plugin.order).toBe(10);
  });

  it('should register all health checks on init', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const checks = [
      { name: 'check-1', type: 'custom' as const, check: async () => ({ healthy: true }) },
      { name: 'check-2', type: 'custom' as const, check: async () => ({ healthy: true }) },
    ];

    const plugin = createHealthPlugin({ checks });

    await plugin.onInit?.(mockContext);

    expect(mockRegisterHealthCheck).toHaveBeenCalledTimes(2);
    expect(mockRegisterHealthCheck).toHaveBeenCalledWith(checks[0]);
    expect(mockRegisterHealthCheck).toHaveBeenCalledWith(checks[1]);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Registered 2 health checks')
    );
  });

  it('should handle empty checks array', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const plugin = createHealthPlugin({ checks: [] });

    await plugin.onInit?.(mockContext);

    expect(mockRegisterHealthCheck).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Registered 0 health checks')
    );
  });
});

describe('Config Plugin', () => {
  let mockLogger: Logger;
  let mockContext: PluginContext;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockContext = {
      config: {
        productName: 'Test',
        port: 3000,
      },
      app: {} as any,
      router: {} as any,
      logger: mockLogger,
      registerHealthCheck: vi.fn(),
    };

    // Set up test environment variables
    process.env.TEST_VAR = 'test-value';
    process.env.TEST_SECRET = 'super-secret-password';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.TEST_VAR;
    delete process.env.TEST_SECRET;
    delete process.env.NODE_ENV;
  });

  it('should create a config plugin with correct name and order', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: [],
      mask: [],
    });

    expect(plugin.name).toBe('config');
    expect(plugin.order).toBe(30);
  });

  it('should have /config and /config/validate routes', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['TEST_VAR'],
      mask: [],
    });

    expect(plugin.routes).toHaveLength(2);
    expect(plugin.routes?.find((r) => r.path === '/config')).toBeDefined();
    expect(plugin.routes?.find((r) => r.path === '/config/validate')).toBeDefined();
  });

  it('should return visible env vars', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['TEST_VAR'],
      mask: [],
    });

    const configRoute = plugin.routes?.find((r) => r.path === '/config');
    const req = createMockRequest();
    const res = createMockResponse();

    configRoute?.handler(req as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      environment: 'test',
      config: {
        TEST_VAR: 'test-value',
      },
    });
  });

  it('should mask sensitive values', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['TEST_SECRET'],
      mask: ['secret'],
    });

    const configRoute = plugin.routes?.find((r) => r.path === '/config');
    const req = createMockRequest();
    const res = createMockResponse();

    configRoute?.handler(req as any, res, vi.fn());

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.config.TEST_SECRET).not.toBe('super-secret-password');
    expect(responseData.config.TEST_SECRET).toContain('*');
  });

  it('should show <not set> for missing env vars', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['NON_EXISTENT_VAR'],
      mask: [],
    });

    const configRoute = plugin.routes?.find((r) => r.path === '/config');
    const req = createMockRequest();
    const res = createMockResponse();

    configRoute?.handler(req as any, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      environment: 'test',
      config: {
        NON_EXISTENT_VAR: '<not set>',
      },
    });
  });

  describe('validation', () => {
    it('should validate required env vars', async () => {
      const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

      const plugin = createConfigPlugin({
        show: [],
        mask: [],
        validate: [{ key: 'MISSING_REQUIRED', required: true }],
      });

      const validateRoute = plugin.routes?.find((r) => r.path === '/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(false);
      expect(responseData.results[0].valid).toBe(false);
      expect(responseData.results[0].message).toContain('not set');
    });

    it('should validate pattern matching', async () => {
      process.env.EMAIL_VAR = 'invalid-email';

      const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

      const plugin = createConfigPlugin({
        show: [],
        mask: [],
        validate: [{ key: 'EMAIL_VAR', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
      });

      const validateRoute = plugin.routes?.find((r) => r.path === '/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(false);
      expect(responseData.results[0].message).toContain('does not match');

      delete process.env.EMAIL_VAR;
    });

    it('should validate min length', async () => {
      process.env.SHORT_VAR = 'ab';

      const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

      const plugin = createConfigPlugin({
        show: [],
        mask: [],
        validate: [{ key: 'SHORT_VAR', minLength: 10 }],
      });

      const validateRoute = plugin.routes?.find((r) => r.path === '/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(false);
      expect(responseData.results[0].message).toContain('too short');

      delete process.env.SHORT_VAR;
    });

    it('should return valid when all validations pass', async () => {
      process.env.VALID_VAR = 'valid-value-here';

      const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

      const plugin = createConfigPlugin({
        show: [],
        mask: [],
        validate: [
          { key: 'VALID_VAR', required: true, minLength: 5 },
          { key: 'TEST_VAR', required: true },
        ],
      });

      const validateRoute = plugin.routes?.find((r) => r.path === '/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(true);

      delete process.env.VALID_VAR;
    });

    it('should handle empty validation rules', async () => {
      const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

      const plugin = createConfigPlugin({
        show: [],
        mask: [],
        // No validate array
      });

      const validateRoute = plugin.routes?.find((r) => r.path === '/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(true);
      expect(responseData.results).toHaveLength(0);
    });
  });

  it('should log on init', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['VAR1', 'VAR2', 'VAR3'],
      mask: [],
    });

    await plugin.onInit?.(mockContext);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('3 visible vars')
    );
  });
});

describe('maskValue function', () => {
  it('should mask short values completely', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');
    process.env.SHORT = 'abc';

    const plugin = createConfigPlugin({
      show: ['SHORT'],
      mask: ['short'],
    });

    const configRoute = plugin.routes?.find((r) => r.path === '/config');
    const res = createMockResponse();

    configRoute?.handler(createMockRequest() as any, res, vi.fn());

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.config.SHORT).toBe('****');

    delete process.env.SHORT;
  });

  it('should preserve first and last two characters for longer values', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');
    process.env.LONGER_SECRET = 'mysecretvalue';

    const plugin = createConfigPlugin({
      show: ['LONGER_SECRET'],
      mask: ['secret'],
    });

    const configRoute = plugin.routes?.find((r) => r.path === '/config');
    const res = createMockResponse();

    configRoute?.handler(createMockRequest() as any, res, vi.fn());

    const responseData = res.json.mock.calls[0][0];
    const masked = responseData.config.LONGER_SECRET;
    expect(masked.startsWith('my')).toBe(true);
    expect(masked.endsWith('ue')).toBe(true);
    expect(masked.includes('*')).toBe(true);

    delete process.env.LONGER_SECRET;
  });
});
