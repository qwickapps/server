/**
 * Unit tests for Plugins
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Logger } from '../src/core/types.js';
import type { PluginRegistry } from '../src/core/plugin-registry.js';

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

// Create a mock registry that matches the new Plugin interface
function createMockRegistry(mockLogger: Logger): PluginRegistry & { routes: Map<string, any> } {
  const routes = new Map<string, any>();

  return {
    routes,
    hasPlugin: vi.fn().mockReturnValue(false),
    getPlugin: vi.fn().mockReturnValue(null),
    listPlugins: vi.fn().mockReturnValue([]),
    addRoute: vi.fn().mockImplementation((route) => {
      routes.set(route.path, route);
    }),
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
    getLogger: vi.fn().mockReturnValue(mockLogger),
  };
}

describe('Health Plugin', () => {
  let mockLogger: Logger;
  let mockRegistry: ReturnType<typeof createMockRegistry>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry(mockLogger);
  });

  it('should create a health plugin with correct id and name', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const plugin = createHealthPlugin({
      checks: [],
    });

    expect(plugin.id).toBe('health');
    expect(plugin.name).toBe('Health Plugin');
  });

  it('should register all health checks on start', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const checks = [
      { name: 'check-1', type: 'custom' as const, check: async () => ({ healthy: true }) },
      { name: 'check-2', type: 'custom' as const, check: async () => ({ healthy: true }) },
    ];

    const plugin = createHealthPlugin({ checks });

    await plugin.onStart({}, mockRegistry);

    expect(mockRegistry.registerHealthCheck).toHaveBeenCalledTimes(2);
    expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(checks[0]);
    expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(checks[1]);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Registered 2 health checks')
    );
  });

  it('should handle empty checks array', async () => {
    const { createHealthPlugin } = await import('../src/plugins/health-plugin.js');

    const plugin = createHealthPlugin({ checks: [] });

    await plugin.onStart({}, mockRegistry);

    expect(mockRegistry.registerHealthCheck).not.toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Registered 0 health checks')
    );
  });
});

describe('Config Plugin', () => {
  let mockLogger: Logger;
  let mockRegistry: ReturnType<typeof createMockRegistry>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry(mockLogger);

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

  it('should create a config plugin with correct id and name', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: [],
      mask: [],
    });

    expect(plugin.id).toBe('config');
    expect(plugin.name).toBe('Config Plugin');
  });

  it('should register /config and /config/validate routes', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['TEST_VAR'],
      mask: [],
    });

    await plugin.onStart({}, mockRegistry);

    expect(mockRegistry.addRoute).toHaveBeenCalledTimes(2);
    expect(mockRegistry.routes.has('/config')).toBe(true);
    expect(mockRegistry.routes.has('/config/validate')).toBe(true);
  });

  it('should return visible env vars', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['TEST_VAR'],
      mask: [],
    });

    await plugin.onStart({}, mockRegistry);

    const configRoute = mockRegistry.routes.get('/config');
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

    await plugin.onStart({}, mockRegistry);

    const configRoute = mockRegistry.routes.get('/config');
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

    await plugin.onStart({}, mockRegistry);

    const configRoute = mockRegistry.routes.get('/config');
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

      await plugin.onStart({}, mockRegistry);

      const validateRoute = mockRegistry.routes.get('/config/validate');
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

      await plugin.onStart({}, mockRegistry);

      const validateRoute = mockRegistry.routes.get('/config/validate');
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

      await plugin.onStart({}, mockRegistry);

      const validateRoute = mockRegistry.routes.get('/config/validate');
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

      await plugin.onStart({}, mockRegistry);

      const validateRoute = mockRegistry.routes.get('/config/validate');
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

      await plugin.onStart({}, mockRegistry);

      const validateRoute = mockRegistry.routes.get('/config/validate');
      const req = createMockRequest();
      const res = createMockResponse();

      validateRoute?.handler(req as any, res, vi.fn());

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.valid).toBe(true);
      expect(responseData.results).toHaveLength(0);
    });
  });

  it('should log on start', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');

    const plugin = createConfigPlugin({
      show: ['VAR1', 'VAR2', 'VAR3'],
      mask: [],
    });

    await plugin.onStart({}, mockRegistry);

    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('3 vars')
    );
  });
});

describe('maskValue function', () => {
  let mockLogger: Logger;
  let mockRegistry: ReturnType<typeof createMockRegistry>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRegistry = createMockRegistry(mockLogger);
  });

  it('should mask short values completely', async () => {
    const { createConfigPlugin } = await import('../src/plugins/config-plugin.js');
    process.env.SHORT = 'abc';

    const plugin = createConfigPlugin({
      show: ['SHORT'],
      mask: ['short'],
    });

    await plugin.onStart({}, mockRegistry);

    const configRoute = mockRegistry.routes.get('/config');
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

    await plugin.onStart({}, mockRegistry);

    const configRoute = mockRegistry.routes.get('/config');
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
