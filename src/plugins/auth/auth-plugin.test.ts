/**
 * Auth Plugin Tests
 *
 * Unit tests for the authentication plugin and adapters.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { basicAdapter } from './adapters/basic-adapter.js';
import type { AuthenticatedUser } from './types.js';

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
    const mockRegistry = {
      getApp: () => mockApp,
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
    const mockRegistry = {
      getApp: () => mockApp,
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
    const mockRegistry = {
      getApp: () => mockApp,
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
    const mockRegistry = {
      getApp: () => mockApp,
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
