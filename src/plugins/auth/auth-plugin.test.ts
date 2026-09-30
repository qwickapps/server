/**
 * Auth Plugin Tests
 *
 * Unit tests for the authentication plugin and adapters.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { type Application } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { request as httpRequest } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Logger } from '../../core/types.js';
import { HealthManager } from '../../core/health-manager.js';
import { createPluginRegistry } from '../../core/plugin-registry.js';
import { basicAdapter } from './adapters/basic-adapter.js';
import { createAuthPlugin, requireAuth } from './auth-plugin.js';
import type { AuthAdapter, AuthenticatedRequest, AuthenticatedUser } from './types.js';

// Mock request/response helpers
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    path: '/',
    originalUrl: '/',
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

async function get(app: Application, path: string, headers: Record<string, string> = {}) {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  try {
    return await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const request = httpRequest({ hostname: '127.0.0.1', port, path, headers }, (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => resolve({
          status: response.statusCode ?? 0,
          body: Buffer.concat(chunks).toString('utf8'),
        }));
      });
      request.on('error', reject);
      request.end();
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function createTestAdapter(getUser = vi.fn((): AuthenticatedUser => ({
  id: 'user-123',
  email: 'test@example.com',
}))): AuthAdapter {
  return {
    name: 'test',
    initialize: () => (_req, _res, next) => next(),
    isAuthenticated: (req) => req.get('x-test-authenticated') === 'true',
    getUser,
  };
}

describe('app-level auth middleware', () => {
  function setup() {
    const app = express();
    const router = express.Router();
    const logger = createMockLogger();
    const healthManager = new HealthManager(logger);
    const registry = createPluginRegistry(app, router, logger, healthManager, () => logger);

    app.use('/qapi', router);

    return { app, router, registry, healthManager };
  }

  it('populates req.auth for a direct app route registered before plugin startup', async () => {
    const { app, registry, healthManager } = setup();
    const getUser = vi.fn((): AuthenticatedUser => ({
      id: 'user-123',
      email: 'test@example.com',
    }));

    app.get('/protected', requireAuth(), (req, res) => {
      res.json((req as AuthenticatedRequest).auth);
    });

    await registry.startPlugin(createAuthPlugin({
      adapter: createTestAdapter(getUser),
      authRequired: true,
    }), {});

    const response = await get(app, '/protected', { 'x-test-authenticated': 'true' });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      isAuthenticated: true,
      user: { id: 'user-123' },
      adapter: 'test',
    });
    expect(getUser).toHaveBeenCalledOnce();
    healthManager.shutdown();
  });

  it('keeps app routes opt-in when plugin auth is required', async () => {
    const { app, registry, healthManager } = setup();

    app.get('/public', (_req, res) => res.sendStatus(204));

    await registry.startPlugin(createAuthPlugin({
      adapter: createTestAdapter(),
      authRequired: true,
    }), {});

    const response = await get(app, '/public');

    expect(response.status).toBe(204);
    healthManager.shutdown();
  });

  it('preserves mount-relative exclusions for /qapi routes', async () => {
    const { app, router, registry, healthManager } = setup();
    const getUser = vi.fn((): AuthenticatedUser => ({
      id: 'user-123',
      email: 'test@example.com',
    }));

    await registry.startPlugin(createAuthPlugin({
      adapter: createTestAdapter(getUser),
      authRequired: true,
      excludePaths: ['/public'],
    }), {});
    router.get('/public', (req, res) => {
      res.json((req as AuthenticatedRequest).auth);
    });

    const response = await get(app, '/qapi/public', { 'x-test-authenticated': 'true' });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({ isAuthenticated: false });
    expect(getUser).not.toHaveBeenCalled();
    healthManager.shutdown();
  });
});

describe('basicAdapter', () => {
  const config = {
    username: 'admin',
    password: 'secret123',
    realm: 'Test Realm',
  };

  let adapter: ReturnType<typeof basicAdapter>;

  beforeEach(() => {
    adapter = basicAdapter(config);
  });

  describe('name', () => {
    it('should return "basic"', () => {
      expect(adapter.name).toBe('basic');
    });
  });

  describe('initialize', () => {
    it('should return a pass-through middleware', () => {
      const middleware = adapter.initialize();
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Handle both single middleware and array of middlewares
      if (Array.isArray(middleware)) {
        middleware[0](req, res, next);
      } else {
        middleware(req, res, next);
      }

      expect(next).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid basic auth credentials', () => {
      const expectedAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      const req = createMockRequest({
        headers: { authorization: expectedAuth },
      });

      expect(adapter.isAuthenticated(req)).toBe(true);
    });

    it('should return false for invalid credentials', () => {
      const wrongAuth = `Basic ${Buffer.from('admin:wrongpassword').toString('base64')}`;
      const req = createMockRequest({
        headers: { authorization: wrongAuth },
      });

      expect(adapter.isAuthenticated(req)).toBe(false);
    });

    it('should return false for missing authorization header', () => {
      const req = createMockRequest();
      expect(adapter.isAuthenticated(req)).toBe(false);
    });

    it('should return false for non-basic auth header', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer some-token' },
      });
      expect(adapter.isAuthenticated(req)).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return user for authenticated request', async () => {
      const expectedAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      const req = createMockRequest({
        headers: { authorization: expectedAuth },
      });

      const user = await Promise.resolve(adapter.getUser(req));
      expect(user).not.toBeNull();
      expect(user?.id).toBe('basic-auth-user');
      expect(user?.email).toBe('admin@localhost');
      expect(user?.name).toBe('admin');
      expect(user?.roles).toContain('admin');
    });

    it('should return null for unauthenticated request', async () => {
      const req = createMockRequest();
      expect(await Promise.resolve(adapter.getUser(req))).toBeNull();
    });
  });

  describe('hasRoles', () => {
    it('should return true if user has the role', () => {
      const expectedAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      const req = createMockRequest({
        headers: { authorization: expectedAuth },
      });

      expect(adapter.hasRoles!(req, ['admin'])).toBe(true);
    });

    it('should return false if user does not have the role', () => {
      const expectedAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      const req = createMockRequest({
        headers: { authorization: expectedAuth },
      });

      expect(adapter.hasRoles!(req, ['superadmin'])).toBe(false);
    });
  });

  describe('onUnauthorized', () => {
    it('should set WWW-Authenticate header and return 401', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      adapter.onUnauthorized!(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm="Test Realm"');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    });
  });
});

describe('Auth Plugin helpers', () => {
  // These tests would require more complex setup with express app
  // For now, we test the basic functionality

  it('should export all required functions', async () => {
    const authModule = await import('./auth-plugin.js');

    expect(authModule.createAuthPlugin).toBeDefined();
    expect(authModule.isAuthenticated).toBeDefined();
    expect(authModule.getAuthenticatedUser).toBeDefined();
    expect(authModule.getAccessToken).toBeDefined();
    expect(authModule.requireAuth).toBeDefined();
    expect(authModule.requireRoles).toBeDefined();
    expect(authModule.requireAnyRole).toBeDefined();
  });
});

describe('onAuthenticated callback', () => {
  // Mock adapter that always authenticates
  function createMockAdapter(user: AuthenticatedUser | null): ReturnType<typeof basicAdapter> {
    return {
      name: 'mock',
      initialize: () => (_req: Request, _res: Response, next: NextFunction) => next(),
      isAuthenticated: () => user !== null,
      getUser: () => user,
    };
  }

  it('should call onAuthenticated callback after successful authentication', async () => {
    const { createAuthPlugin } = await import('./auth-plugin.js');
    const mockUser: AuthenticatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);

    const plugin = createAuthPlugin({
      adapter: createMockAdapter(mockUser),
      authRequired: false,
      onAuthenticated,
    });

    // Create mock registry
    const mockApp = {
      use: vi.fn(),
    };
    const mockRouter = {
      use: vi.fn(),
    };
    const mockRegistry = {
      getApp: () => mockApp,
      getRouter: () => mockRouter,
      addAppMiddleware: mockApp.use,
      addRoute: vi.fn(),
    };

    // Start the plugin to register middleware
    await plugin.onStart?.({} as never, mockRegistry as never);

    // Get the auth middleware (last middleware added)
    const authMiddleware = mockApp.use.mock.calls[mockApp.use.mock.calls.length - 1][0];

    // Call middleware
    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(onAuthenticated).toHaveBeenCalledWith(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should not call onAuthenticated when authentication fails', async () => {
    const { createAuthPlugin } = await import('./auth-plugin.js');
    const onAuthenticated = vi.fn().mockResolvedValue(undefined);

    const plugin = createAuthPlugin({
      adapter: createMockAdapter(null), // null user = not authenticated
      authRequired: false,
      onAuthenticated,
    });

    const mockApp = {
      use: vi.fn(),
    };
    const mockRouter = {
      use: vi.fn(),
    };
    const mockRegistry = {
      getApp: () => mockApp,
      getRouter: () => mockRouter,
      addAppMiddleware: mockApp.use,
      addRoute: vi.fn(),
    };

    await plugin.onStart?.({} as never, mockRegistry as never);

    const authMiddleware = mockApp.use.mock.calls[mockApp.use.mock.calls.length - 1][0];

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should not fail authentication when onAuthenticated throws an error', async () => {
    const { createAuthPlugin } = await import('./auth-plugin.js');
    const mockUser: AuthenticatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };
    const onAuthenticated = vi.fn().mockRejectedValue(new Error('Sync failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plugin = createAuthPlugin({
      adapter: createMockAdapter(mockUser),
      authRequired: false,
      onAuthenticated,
    });

    const mockApp = {
      use: vi.fn(),
    };
    const mockRouter = {
      use: vi.fn(),
    };
    const mockRegistry = {
      getApp: () => mockApp,
      getRouter: () => mockRouter,
      addAppMiddleware: mockApp.use,
      addRoute: vi.fn(),
    };

    await plugin.onStart?.({} as never, mockRegistry as never);

    const authMiddleware = mockApp.use.mock.calls[mockApp.use.mock.calls.length - 1][0];

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    // Callback was called
    expect(onAuthenticated).toHaveBeenCalledWith(mockUser);
    // Error was logged
    expect(consoleSpy).toHaveBeenCalled();
    // Request still proceeds
    expect(next).toHaveBeenCalled();
    // Auth info is still set correctly
    expect((req as unknown as { auth: { isAuthenticated: boolean } }).auth.isAuthenticated).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should not call onAuthenticated when callback is not provided', async () => {
    const { createAuthPlugin } = await import('./auth-plugin.js');
    const mockUser: AuthenticatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const plugin = createAuthPlugin({
      adapter: createMockAdapter(mockUser),
      authRequired: false,
      // No onAuthenticated callback
    });

    const mockApp = {
      use: vi.fn(),
    };
    const mockRouter = {
      use: vi.fn(),
    };
    const mockRegistry = {
      getApp: () => mockApp,
      getRouter: () => mockRouter,
      addAppMiddleware: mockApp.use,
      addRoute: vi.fn(),
    };

    await plugin.onStart?.({} as never, mockRegistry as never);

    const authMiddleware = mockApp.use.mock.calls[mockApp.use.mock.calls.length - 1][0];

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    // Should not throw
    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
