/**
 * Supertokens Adapter Tests
 *
 * Unit tests for the Supertokens authentication adapter.
 * Tests against supertokens-node v20+ API.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { supertokensAdapter } from './adapters/supertokens-adapter.js';
import type { SupertokensAdapterConfig, AuthenticatedUser } from './types.js';

// Type for extended request with our custom properties
interface SupertokensExtendedRequest extends Request {
  _supertokensUser?: AuthenticatedUser;
  _supertokensRes?: Response;
  _supertokensSession?: unknown;
}

// Mock Supertokens modules
vi.mock('supertokens-node', () => ({
  default: {
    init: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock('supertokens-node/recipe/session', () => ({
  default: {
    init: vi.fn(),
    getSession: vi.fn(),
  },
}));

vi.mock('supertokens-node/recipe/emailpassword', () => ({
  default: {
    init: vi.fn(),
  },
}));

vi.mock('supertokens-node/recipe/thirdparty', () => ({
  default: {
    init: vi.fn(),
  },
}));

vi.mock('supertokens-node/framework/express', () => ({
  middleware: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
  errorHandler: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
}));

// Mock request/response helpers
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    cookies: {},
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

describe('supertokensAdapter', () => {
  const validConfig: SupertokensAdapterConfig = {
    connectionUri: 'http://localhost:3567',
    appName: 'Test App',
    apiDomain: 'http://localhost:3000',
    websiteDomain: 'http://localhost:3000',
  };

  let adapter: ReturnType<typeof supertokensAdapter>;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = supertokensAdapter(validConfig);
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('name', () => {
    it('should return "supertokens"', () => {
      expect(adapter.name).toBe('supertokens');
    });
  });

  describe('initialize', () => {
    it('should return an array of middlewares', () => {
      const middlewares = adapter.initialize();
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2); // init middleware + supertokens middleware
    });

    it('should store response on request for later use', async () => {
      const middlewares = adapter.initialize() as RequestHandler[];
      const req = createMockRequest() as SupertokensExtendedRequest;
      const res = createMockResponse();
      const next = vi.fn();

      // Apply first middleware (init)
      await middlewares[0](req, res, next);

      expect(req._supertokensRes).toBe(res);
      expect(next).toHaveBeenCalled();
    });

    it('should initialize Supertokens SDK on first request', async () => {
      const supertokens = await import('supertokens-node');
      const middlewares = adapter.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(supertokens.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          framework: 'express',
          appInfo: expect.objectContaining({
            appName: 'Test App',
            apiDomain: 'http://localhost:3000',
            websiteDomain: 'http://localhost:3000',
            apiBasePath: '/auth',
            websiteBasePath: '/auth',
          }),
        })
      );
    });

    it('should use custom apiBasePath when provided', async () => {
      const supertokens = await import('supertokens-node');
      const customAdapter = supertokensAdapter({
        ...validConfig,
        apiBasePath: '/api/auth',
        websiteBasePath: '/auth-ui',
      });

      const middlewares = customAdapter.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(supertokens.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          appInfo: expect.objectContaining({
            apiBasePath: '/api/auth',
            websiteBasePath: '/auth-ui',
          }),
        })
      );
    });

    it('should initialize EmailPassword recipe by default', async () => {
      const EmailPassword = await import('supertokens-node/recipe/emailpassword');

      const middlewares = adapter.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(EmailPassword.default.init).toHaveBeenCalled();
    });

    it('should initialize ThirdParty recipe when social providers configured', async () => {
      const ThirdParty = await import('supertokens-node/recipe/thirdparty');

      const adapterWithProviders = supertokensAdapter({
        ...validConfig,
        socialProviders: {
          google: { clientId: 'google-id', clientSecret: 'google-secret' },
        },
      });

      const middlewares = adapterWithProviders.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(ThirdParty.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          signInAndUpFeature: expect.objectContaining({
            providers: expect.arrayContaining([
              expect.objectContaining({
                config: expect.objectContaining({
                  thirdPartyId: 'google',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session cookie exists', () => {
      const req = createMockRequest({
        cookies: { sAccessToken: 'some-token' },
      });

      expect(adapter.isAuthenticated(req)).toBe(true);
    });

    it('should return true when refresh token exists', () => {
      const req = createMockRequest({
        cookies: { sRefreshToken: 'refresh-token' },
      });

      expect(adapter.isAuthenticated(req)).toBe(true);
    });

    it('should return true when Authorization header exists', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer some-token' },
      });

      expect(adapter.isAuthenticated(req)).toBe(true);
    });

    it('should return false when no auth credentials exist', () => {
      const req = createMockRequest();

      expect(adapter.isAuthenticated(req)).toBe(false);
    });

    it('should return true when user is cached on request', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = { id: 'user-123', email: 'test@example.com' };

      expect(adapter.isAuthenticated(req)).toBe(true);
    });

    it('should return true when session is cached on request', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensSession = { getUserId: () => 'user-123' };

      expect(adapter.isAuthenticated(req)).toBe(true);
    });
  });

  describe('getUser', () => {
    beforeEach(async () => {
      // Initialize adapter to set initialized = true
      const middlewares = adapter.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();
      await middlewares[0](req, res, next);
    });

    it('should return cached user if available', async () => {
      const cachedUser: AuthenticatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = cachedUser;
      req._supertokensRes = createMockResponse();

      const user = await adapter.getUser(req);
      expect(user).toEqual(cachedUser);
    });

    it('should return null when response is not stored on request', async () => {
      const req = createMockRequest();
      const user = await adapter.getUser(req);
      expect(user).toBeNull();
    });

    it('should return null when no session exists', async () => {
      const Session = await import('supertokens-node/recipe/session');
      vi.mocked(Session.default.getSession).mockResolvedValue(null as never);

      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensRes = createMockResponse();

      const user = await adapter.getUser(req);
      expect(user).toBeNull();
    });

    it('should return AuthenticatedUser when session is valid', async () => {
      const Session = await import('supertokens-node/recipe/session');
      const supertokens = await import('supertokens-node');

      const mockSession = {
        getUserId: vi.fn().mockReturnValue('user-123'),
        getHandle: vi.fn().mockReturnValue('session-handle'),
        getAccessTokenPayload: vi.fn().mockReturnValue({ roles: ['admin'] }),
      };

      const mockUserInfo = {
        emails: ['test@example.com'],
        thirdParty: [],
      };

      vi.mocked(Session.default.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(supertokens.default.getUser).mockResolvedValue(mockUserInfo as never);

      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensRes = createMockResponse();

      const user = await adapter.getUser(req);

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'test',
        picture: undefined,
        emailVerified: true,
        roles: ['admin'],
        raw: expect.objectContaining({
          sessionHandle: 'session-handle',
        }),
      });
    });

    it('should cache user on request object', async () => {
      const Session = await import('supertokens-node/recipe/session');
      const supertokens = await import('supertokens-node');

      const mockSession = {
        getUserId: vi.fn().mockReturnValue('user-123'),
        getHandle: vi.fn().mockReturnValue('session-handle'),
        getAccessTokenPayload: vi.fn().mockReturnValue({}),
      };

      const mockUserInfo = {
        emails: ['test@example.com'],
        thirdParty: [],
      };

      vi.mocked(Session.default.getSession).mockResolvedValue(mockSession as never);
      vi.mocked(supertokens.default.getUser).mockResolvedValue(mockUserInfo as never);

      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensRes = createMockResponse();

      await adapter.getUser(req);

      expect(req._supertokensUser).toBeDefined();
      expect(req._supertokensUser?.id).toBe('user-123');
    });

    it('should return null and handle errors gracefully', async () => {
      const Session = await import('supertokens-node/recipe/session');
      vi.mocked(Session.default.getSession).mockRejectedValue(new Error('Session error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensRes = createMockResponse();

      const user = await adapter.getUser(req);

      expect(user).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('hasRoles', () => {
    it('should return true if user has the role', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['admin', 'user'],
      };

      expect(adapter.hasRoles!(req, ['admin'])).toBe(true);
    });

    it('should return true if user has all required roles', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['admin', 'user', 'editor'],
      };

      expect(adapter.hasRoles!(req, ['admin', 'editor'])).toBe(true);
    });

    it('should return false if user does not have the role', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
      };

      expect(adapter.hasRoles!(req, ['admin'])).toBe(false);
    });

    it('should return false if user has no roles', () => {
      const req = createMockRequest() as SupertokensExtendedRequest;
      req._supertokensUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      expect(adapter.hasRoles!(req, ['admin'])).toBe(false);
    });

    it('should return false if no user on request', () => {
      const req = createMockRequest();
      expect(adapter.hasRoles!(req, ['admin'])).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return null (session-based auth)', () => {
      const req = createMockRequest({
        cookies: { sAccessToken: 'some-token' },
      });

      expect(adapter.getAccessToken!(req)).toBeNull();
    });
  });

  describe('onUnauthorized', () => {
    it('should return 401 with JSON response', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      adapter.onUnauthorized!(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in.',
        hint: 'Use the /auth endpoints to authenticate',
      });
    });
  });

  describe('shutdown', () => {
    it('should resolve without error', async () => {
      await expect(adapter.shutdown!()).resolves.toBeUndefined();
    });

    it('should reset initialization state', async () => {
      // First initialize
      const middlewares = adapter.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();
      await middlewares[0](req, res, next);

      // Shutdown
      await adapter.shutdown!();

      // After shutdown, getUser should return null (not initialized)
      const user = await adapter.getUser(createMockRequest());
      expect(user).toBeNull();
    });
  });

  describe('configuration', () => {
    it('should pass apiKey to Supertokens when provided', async () => {
      const supertokens = await import('supertokens-node');
      const adapterWithApiKey = supertokensAdapter({
        ...validConfig,
        apiKey: 'my-api-key',
      });

      const middlewares = adapterWithApiKey.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(supertokens.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          supertokens: expect.objectContaining({
            apiKey: 'my-api-key',
          }),
        })
      );
    });

    it('should not initialize EmailPassword when disabled', async () => {
      const EmailPassword = await import('supertokens-node/recipe/emailpassword');

      const adapterNoEmail = supertokensAdapter({
        ...validConfig,
        enableEmailPassword: false,
      });

      const middlewares = adapterNoEmail.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(EmailPassword.default.init).not.toHaveBeenCalled();
    });

    it('should configure multiple social providers', async () => {
      const ThirdParty = await import('supertokens-node/recipe/thirdparty');

      const adapterWithProviders = supertokensAdapter({
        ...validConfig,
        socialProviders: {
          google: { clientId: 'google-id', clientSecret: 'google-secret' },
          github: { clientId: 'github-id', clientSecret: 'github-secret' },
        },
      });

      const middlewares = adapterWithProviders.initialize() as RequestHandler[];
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middlewares[0](req, res, next);

      expect(ThirdParty.default.init).toHaveBeenCalledWith(
        expect.objectContaining({
          signInAndUpFeature: expect.objectContaining({
            providers: expect.arrayContaining([
              expect.objectContaining({
                config: expect.objectContaining({
                  thirdPartyId: 'google',
                }),
              }),
              expect.objectContaining({
                config: expect.objectContaining({
                  thirdPartyId: 'github',
                }),
              }),
            ]),
          }),
        })
      );
    });
  });
});

describe('supertokensAdapter edge cases', () => {
  it('should handle missing cookies object', () => {
    const adapter = supertokensAdapter({
      connectionUri: 'http://localhost:3567',
      appName: 'Test',
      apiDomain: 'http://localhost:3000',
      websiteDomain: 'http://localhost:3000',
    });

    const req = {
      headers: {},
      path: '/',
      originalUrl: '/',
    } as unknown as Request;

    expect(adapter.isAuthenticated(req)).toBe(false);
  });

  it('should handle empty user emails array', async () => {
    const adapter = supertokensAdapter({
      connectionUri: 'http://localhost:3567',
      appName: 'Test',
      apiDomain: 'http://localhost:3000',
      websiteDomain: 'http://localhost:3000',
    });

    // Initialize first
    const middlewares = adapter.initialize() as RequestHandler[];
    const initReq = createMockRequest();
    const initRes = createMockResponse();
    await middlewares[0](initReq, initRes, vi.fn());

    const Session = await import('supertokens-node/recipe/session');
    const supertokens = await import('supertokens-node');

    const mockSession = {
      getUserId: vi.fn().mockReturnValue('user-123'),
      getHandle: vi.fn().mockReturnValue('session-handle'),
      getAccessTokenPayload: vi.fn().mockReturnValue({}),
    };

    const mockUserInfo = {
      emails: [],
      thirdParty: [{ userId: 'google-user-id' }],
    };

    vi.mocked(Session.default.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(supertokens.default.getUser).mockResolvedValue(mockUserInfo as never);

    const req = createMockRequest() as SupertokensExtendedRequest;
    req._supertokensRes = createMockResponse();

    const user = await adapter.getUser(req);

    expect(user?.email).toBe('');
    expect(user?.name).toBe('google-user-id');
    expect(user?.emailVerified).toBe(false);
  });
});
