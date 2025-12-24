/**
 * Bearer Token Authentication Middleware Tests
 *
 * Unit tests for the bearer token authentication middleware,
 * covering token extraction, scope validation, and authentication flow.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { Plugin, PluginRegistry } from '../src/core/plugin-registry.js';
import type { ApiKey, ApiKeyStore, ApiKeysPluginConfig } from '../src/plugins/api-keys/types.js';
import {
  bearerTokenAuth,
  isApiKeyAuthenticated,
  type ApiKeyAuthenticatedRequest,
  type BearerTokenAuthOptions,
} from '../src/plugins/api-keys/middleware/bearer-token-auth.js';
import { createApiKeysPlugin } from '../src/plugins/api-keys/api-keys-plugin.js';

// Mock the rate limit service
vi.mock('../src/plugins/rate-limit/rate-limit-service.js', () => ({
  isLimited: vi.fn().mockResolvedValue(false),
  incrementLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 99 }),
}));

// ========================================
// Mock Types
// ========================================

type MockRequest = Partial<Request> & {
  headers: Record<string, string | undefined>;
};

type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

type MockApiKeyStore = {
  initialize: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
  recordUsage: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type MockPluginRegistry = {
  hasPlugin: ReturnType<typeof vi.fn>;
  addRoute: ReturnType<typeof vi.fn>;
  registerHealthCheck: ReturnType<typeof vi.fn>;
};

// ========================================
// Mock Factories
// ========================================

function createMockRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    headers: {},
    ...overrides,
  };
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

function createMockNext(): NextFunction {
  return vi.fn();
}

function createMockStore(): MockApiKeyStore {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    verify: vi.fn(),
    recordUsage: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function createMockRegistry(): MockPluginRegistry {
  return {
    hasPlugin: vi.fn().mockReturnValue(true),
    addRoute: vi.fn(),
    registerHealthCheck: vi.fn(),
  };
}

function createMockApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: 'key-123',
    user_id: 'user-456',
    name: 'Test API Key',
    key_hash: 'abc123hash',
    key_prefix: 'qk_test_abc1',
    key_type: 'pat',
    scopes: ['read', 'write'],
    last_used_at: null,
    expires_at: null,
    is_active: true,
    created_at: new Date('2025-01-01T00:00:00Z'),
    updated_at: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

// ========================================
// Helper to initialize plugin
// ========================================

async function initializePlugin(mockStore: MockApiKeyStore): Promise<Plugin> {
  const mockRegistry = createMockRegistry();
  const config: ApiKeysPluginConfig = {
    store: mockStore as unknown as ApiKeyStore,
  };

  const plugin = createApiKeysPlugin(config);
  await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

  return plugin;
}

// ========================================
// Bearer Token Extraction Tests
// ========================================

describe('Bearer Token Authentication - Token Extraction', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should extract valid Bearer token', async () => {
    const mockKey = createMockApiKey();
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_validtoken123',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(mockStore.verify).toHaveBeenCalledWith('qk_test_validtoken123');
    expect(next).toHaveBeenCalled();
  });

  it('should reject request with missing Authorization header', async () => {
    const middleware = bearerTokenAuth();
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid Authorization format', async () => {
    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'InvalidFormat qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with Authorization header missing token', async () => {
    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with Authorization header having extra parts', async () => {
    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer token extra',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });
});

// ========================================
// Token Verification Tests
// ========================================

describe('Bearer Token Authentication - Token Verification', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should authenticate with valid token', async () => {
    const mockKey = createMockApiKey();
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_validtoken',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(mockStore.verify).toHaveBeenCalledWith('qk_test_validtoken');
    expect((req as ApiKeyAuthenticatedRequest).apiKey).toEqual({
      id: 'key-123',
      user_id: 'user-456',
      scopes: ['read', 'write'],
      key_type: 'pat',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    mockStore.verify.mockResolvedValue(null);

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_invalidtoken',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid, expired, or inactive API key',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 if store is not initialized', async () => {
    await plugin.onStop?.(); // Stop plugin to clear store

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication service unavailable',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should record usage for valid token', async () => {
    const mockKey = createMockApiKey();
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(mockStore.recordUsage).toHaveBeenCalledWith('key-123');
  });

  it('should continue if recordUsage fails', async () => {
    const mockKey = createMockApiKey();
    mockStore.verify.mockResolvedValue(mockKey);
    mockStore.recordUsage.mockRejectedValue(new Error('Usage recording failed'));

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

// ========================================
// Scope Validation Tests
// ========================================

describe('Bearer Token Authentication - Scope Validation', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should allow access with sufficient scopes', async () => {
    const mockKey = createMockApiKey({ scopes: ['read', 'write', 'admin'] });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ requiredScopes: ['read', 'write'] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject access with insufficient scopes', async () => {
    const mockKey = createMockApiKey({ scopes: ['read'] });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ requiredScopes: ['read', 'write'] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Insufficient scopes. Required: read, write',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access when no scopes required', async () => {
    const mockKey = createMockApiKey({ scopes: ['read'] });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ requiredScopes: [] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow access when requiredScopes is undefined', async () => {
    const mockKey = createMockApiKey({ scopes: ['read'] });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({});
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

// ========================================
// Key Type Validation Tests
// ========================================

describe('Bearer Token Authentication - Key Type Validation', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should allow access with allowed key type', async () => {
    const mockKey = createMockApiKey({ key_type: 'm2m' });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ allowedKeyTypes: ['m2m'] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject access with disallowed key type', async () => {
    const mockKey = createMockApiKey({ key_type: 'pat' });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ allowedKeyTypes: ['m2m'] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'This endpoint requires m2m keys',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access when no key type restrictions', async () => {
    const mockKey = createMockApiKey({ key_type: 'pat' });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({});
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow multiple key types', async () => {
    const mockKey = createMockApiKey({ key_type: 'pat' });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({ allowedKeyTypes: ['m2m', 'pat'] });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
  });
});

// ========================================
// Custom Error Handler Tests
// ========================================

describe('Bearer Token Authentication - Custom Error Handler', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should use custom onUnauthorized handler', async () => {
    const customHandler = vi.fn();

    const middleware = bearerTokenAuth({ onUnauthorized: customHandler });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer invalid',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    mockStore.verify.mockResolvedValue(null);

    await middleware(req as Request, res as unknown as Response, next);

    expect(customHandler).toHaveBeenCalledWith(
      req,
      res,
      'Invalid, expired, or inactive API key'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should use custom handler for missing token', async () => {
    const customHandler = vi.fn();

    const middleware = bearerTokenAuth({ onUnauthorized: customHandler });
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(customHandler).toHaveBeenCalledWith(
      req,
      res,
      'Missing or invalid Authorization header'
    );
  });

  it('should use custom handler for insufficient scopes', async () => {
    const mockKey = createMockApiKey({ scopes: ['read'] });
    mockStore.verify.mockResolvedValue(mockKey);

    const customHandler = vi.fn();

    const middleware = bearerTokenAuth({
      requiredScopes: ['write'],
      onUnauthorized: customHandler,
    });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(customHandler).toHaveBeenCalledWith(
      req,
      res,
      'Insufficient scopes. Required: write'
    );
  });
});

// ========================================
// Error Handling Tests
// ========================================

describe('Bearer Token Authentication - Error Handling', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should handle verification errors gracefully', async () => {
    mockStore.verify.mockRejectedValue(new Error('Database error'));

    const middleware = bearerTokenAuth();
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed',
    });
    expect(next).not.toHaveBeenCalled();
  });
});

// ========================================
// Type Guard Tests
// ========================================

describe('isApiKeyAuthenticated', () => {
  it('should return true for request with apiKey', () => {
    const req = {
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        scopes: ['read'],
        key_type: 'pat' as const,
      },
    } as ApiKeyAuthenticatedRequest;

    expect(isApiKeyAuthenticated(req)).toBe(true);
  });

  it('should return false for request without apiKey', () => {
    const req = {} as Request;

    expect(isApiKeyAuthenticated(req)).toBe(false);
  });

  it('should return false for request with undefined apiKey', () => {
    const req = {
      apiKey: undefined,
    } as ApiKeyAuthenticatedRequest;

    expect(isApiKeyAuthenticated(req)).toBe(false);
  });
});

// ========================================
// Integration Tests
// ========================================

describe('Bearer Token Authentication - Integration', () => {
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockStore = createMockStore();
    plugin = await initializePlugin(mockStore);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  it('should authenticate with all options combined', async () => {
    const mockKey = createMockApiKey({
      key_type: 'm2m',
      scopes: ['read', 'write', 'admin'],
    });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({
      requiredScopes: ['read', 'write'],
      allowedKeyTypes: ['m2m'],
    });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_validtoken',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect((req as ApiKeyAuthenticatedRequest).apiKey).toEqual({
      id: 'key-123',
      user_id: 'user-456',
      scopes: ['read', 'write', 'admin'],
      key_type: 'm2m',
    });
    expect(mockStore.recordUsage).toHaveBeenCalledWith('key-123');
    expect(next).toHaveBeenCalled();
  });

  it('should reject when any validation fails', async () => {
    const mockKey = createMockApiKey({
      key_type: 'pat', // Wrong type
      scopes: ['read', 'write', 'admin'],
    });
    mockStore.verify.mockResolvedValue(mockKey);

    const middleware = bearerTokenAuth({
      requiredScopes: ['read', 'write'],
      allowedKeyTypes: ['m2m'], // Only allow m2m
    });
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer qk_test_token',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await middleware(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'This endpoint requires m2m keys',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
