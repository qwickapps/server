/**
 * API Keys Plugin Tests
 *
 * Unit tests for the API Keys plugin, covering plugin lifecycle,
 * API routes, helper functions, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { Plugin, PluginRegistry, HealthCheckConfig } from '../src/core/plugin-registry.js';
import type { ApiKeyStore, ApiKey, ApiKeysPluginConfig } from '../src/plugins/api-keys/types.js';
import type { AuthenticatedRequest } from '../src/plugins/auth/types.js';
import {
  createApiKeysPlugin,
  getApiKeysStore,
  verifyApiKey,
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
} from '../src/plugins/api-keys/api-keys-plugin.js';

// ========================================
// Mock Types
// ========================================

type MockPluginRegistry = {
  hasPlugin: ReturnType<typeof vi.fn>;
  addRoute: ReturnType<typeof vi.fn>;
  registerHealthCheck: ReturnType<typeof vi.fn>;
};

type MockApiKeyStore = {
  initialize: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
  recordUsage: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
};

type MockRequest = Partial<AuthenticatedRequest>;
type MockResponse = {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

// ========================================
// Mock Factories
// ========================================

function createMockRegistry(): MockPluginRegistry {
  return {
    hasPlugin: vi.fn(),
    addRoute: vi.fn(),
    registerHealthCheck: vi.fn(),
  };
}

function createMockStore(): MockApiKeyStore {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    verify: vi.fn(),
    recordUsage: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockRequest(overrides: MockRequest = {}): MockRequest {
  return {
    params: {},
    body: {},
    auth: {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    ...overrides,
  };
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res;
}

function createMockApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: 'key-123',
    user_id: 'user-123',
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
// Plugin Lifecycle Tests
// ========================================

describe('API Keys Plugin - Lifecycle', () => {
  let mockRegistry: MockPluginRegistry;
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(() => {
    mockRegistry = createMockRegistry();
    mockStore = createMockStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onStart', () => {
    it('should throw error if users plugin is not loaded', async () => {
      mockRegistry.hasPlugin.mockReturnValue(false);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await expect(
        plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry)
      ).rejects.toThrow('API Keys plugin requires Users plugin to be loaded first');

      expect(mockRegistry.hasPlugin).toHaveBeenCalledWith('users');
    });

    it('should initialize the store when users plugin is loaded', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'api-keys-store',
          type: 'custom',
          check: expect.any(Function),
        })
      );
    });

    it('should register API routes when apiEnabled is true (default)', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      // Should register 5 routes (POST, GET, GET/:id, PUT/:id, DELETE/:id)
      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(5);

      // Verify each route
      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'post', path: '/api-keys', pluginId: 'api-keys' })
      );
      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'get', path: '/api-keys', pluginId: 'api-keys' })
      );
      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'get', path: '/api-keys/:id', pluginId: 'api-keys' })
      );
      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'put', path: '/api-keys/:id', pluginId: 'api-keys' })
      );
      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'delete', path: '/api-keys/:id', pluginId: 'api-keys' })
      );
    });

    it('should NOT register API routes when apiEnabled is false', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
        api: {
          enabled: false,
        },
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      expect(mockRegistry.addRoute).not.toHaveBeenCalled();
    });

    it('should use custom API prefix if provided', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
        api: {
          prefix: '/custom-keys',
        },
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      expect(mockRegistry.addRoute).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/custom-keys' })
      );
    });

    it('should run health check successfully when store is initialized', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);

      // Get the health check function
      const healthCheckCall = mockRegistry.registerHealthCheck.mock.calls[0][0] as HealthCheckConfig;
      const result = await healthCheckCall.check();

      expect(result).toEqual({ healthy: true });
    });
  });

  describe('onStop', () => {
    it('should shutdown the store and clear reference', async () => {
      mockRegistry.hasPlugin.mockReturnValue(true);

      const config: ApiKeysPluginConfig = {
        store: mockStore as unknown as ApiKeyStore,
      };

      plugin = createApiKeysPlugin(config);

      await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
      expect(getApiKeysStore()).toBeNull();
    });
  });
});

// ========================================
// API Routes Tests
// ========================================

describe('API Keys Plugin - Routes', () => {
  let mockRegistry: MockPluginRegistry;
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockRegistry = createMockRegistry();
    mockStore = createMockStore();
    mockRegistry.hasPlugin.mockReturnValue(true);

    const config: ApiKeysPluginConfig = {
      store: mockStore as unknown as ApiKeyStore,
    };

    plugin = createApiKeysPlugin(config);
    await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  describe('POST /api-keys', () => {
    it('should create API key and return plaintext key', async () => {
      const mockKey = createMockApiKey({ name: 'Test Key' }); // Match request name
      const mockKeyWithPlaintext = {
        ...mockKey,
        plaintext_key: 'qk_test_abcdefghijklmnopqrstuvwxyz1234567890',
      };

      mockStore.create.mockResolvedValue(mockKeyWithPlaintext);

      const postRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'post' && call[0].path === '/api-keys'
      );

      const req = createMockRequest({
        body: {
          name: 'Test Key',
          key_type: 'pat',
          scopes: ['read', 'write'],
        },
      });
      const res = createMockResponse();

      await postRoute![0].handler(req as Request, res as unknown as Response);

      expect(mockStore.create).toHaveBeenCalledWith({
        user_id: 'user-123',
        name: 'Test Key',
        key_type: 'pat',
        scopes: ['read', 'write'],
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'qk_test_abcdefghijklmnopqrstuvwxyz1234567890',
          name: 'Test Key',
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      const postRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'post' && call[0].path === '/api-keys'
      );

      const req = createMockRequest({ auth: undefined });
      const res = createMockResponse();

      await postRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 400 if request body is invalid', async () => {
      const postRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'post' && call[0].path === '/api-keys'
      );

      const req = createMockRequest({
        body: {
          // Missing required fields
          name: '',
        },
      });
      const res = createMockResponse();

      await postRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid request',
        })
      );
    });

    it('should return 500 on store error', async () => {
      mockStore.create.mockRejectedValue(new Error('Database error'));

      const postRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'post' && call[0].path === '/api-keys'
      );

      const req = createMockRequest({
        body: {
          name: 'Test Key',
          key_type: 'pat',
          scopes: ['read'],
        },
      });
      const res = createMockResponse();

      await postRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create API key' });
    });
  });

  describe('GET /api-keys', () => {
    it('should list user API keys with sanitized fields', async () => {
      const mockKeys = [
        createMockApiKey({ id: 'key-1', name: 'Key 1' }),
        createMockApiKey({ id: 'key-2', name: 'Key 2' }),
      ];

      mockStore.list.mockResolvedValue(mockKeys);

      const getRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys'
      );

      const req = createMockRequest();
      const res = createMockResponse();

      await getRoute![0].handler(req as Request, res as unknown as Response);

      expect(mockStore.list).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        keys: expect.arrayContaining([
          expect.objectContaining({ id: 'key-1', name: 'Key 1' }),
          expect.objectContaining({ id: 'key-2', name: 'Key 2' }),
        ]),
      });

      // Ensure key_hash is not included
      const responseKeys = (res.json as any).mock.calls[0][0].keys;
      expect(responseKeys[0]).not.toHaveProperty('key_hash');
    });

    it('should return 401 if user is not authenticated', async () => {
      const getRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys'
      );

      const req = createMockRequest({ auth: undefined });
      const res = createMockResponse();

      await getRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 500 on store error', async () => {
      mockStore.list.mockRejectedValue(new Error('Database error'));

      const getRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys'
      );

      const req = createMockRequest();
      const res = createMockResponse();

      await getRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to list API keys' });
    });
  });

  describe('GET /api-keys/:id', () => {
    it('should return specific API key with sanitized fields', async () => {
      const mockKey = createMockApiKey({ id: 'key-123', name: 'Test Key' });
      mockStore.get.mockResolvedValue(mockKey);

      const getByIdRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'key-123' } });
      const res = createMockResponse();

      await getByIdRoute![0].handler(req as Request, res as unknown as Response);

      expect(mockStore.get).toHaveBeenCalledWith('user-123', 'key-123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'key-123', name: 'Test Key' })
      );

      // Ensure key_hash is not included
      const responseKey = (res.json as any).mock.calls[0][0];
      expect(responseKey).not.toHaveProperty('key_hash');
    });

    it('should return 404 if key is not found', async () => {
      mockStore.get.mockResolvedValue(null);

      const getByIdRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'nonexistent' } });
      const res = createMockResponse();

      await getByIdRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'API key not found' });
    });

    it('should return 401 if user is not authenticated', async () => {
      const getByIdRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ auth: undefined, params: { id: 'key-123' } });
      const res = createMockResponse();

      await getByIdRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 500 on store error', async () => {
      mockStore.get.mockRejectedValue(new Error('Database error'));

      const getByIdRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'get' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'key-123' } });
      const res = createMockResponse();

      await getByIdRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get API key' });
    });
  });

  describe('PUT /api-keys/:id', () => {
    it('should update API key with sanitized response', async () => {
      const updatedKey = createMockApiKey({ id: 'key-123', name: 'Updated Key' });
      mockStore.update.mockResolvedValue(updatedKey);

      const putRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'put' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({
        params: { id: 'key-123' },
        body: { name: 'Updated Key' },
      });
      const res = createMockResponse();

      await putRoute![0].handler(req as Request, res as unknown as Response);

      expect(mockStore.update).toHaveBeenCalledWith('user-123', 'key-123', { name: 'Updated Key' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'key-123', name: 'Updated Key' })
      );

      // Ensure key_hash is not included
      const responseKey = (res.json as any).mock.calls[0][0];
      expect(responseKey).not.toHaveProperty('key_hash');
    });

    it('should return 404 if key is not found', async () => {
      mockStore.update.mockResolvedValue(null);

      const putRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'put' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({
        params: { id: 'nonexistent' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();

      await putRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'API key not found' });
    });

    it('should return 401 if user is not authenticated', async () => {
      const putRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'put' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({
        auth: undefined,
        params: { id: 'key-123' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();

      await putRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 400 if request body is invalid', async () => {
      const putRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'put' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({
        params: { id: 'key-123' },
        body: { invalid_field: 'value' },
      });
      const res = createMockResponse();

      await putRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid request',
        })
      );
    });

    it('should return 500 on store error', async () => {
      mockStore.update.mockRejectedValue(new Error('Database error'));

      const putRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'put' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({
        params: { id: 'key-123' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();

      await putRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update API key' });
    });
  });

  describe('DELETE /api-keys/:id', () => {
    it('should delete API key and return 204', async () => {
      mockStore.delete.mockResolvedValue(true);

      const deleteRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'delete' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'key-123' } });
      const res = createMockResponse();

      await deleteRoute![0].handler(req as Request, res as unknown as Response);

      expect(mockStore.delete).toHaveBeenCalledWith('user-123', 'key-123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if key is not found', async () => {
      mockStore.delete.mockResolvedValue(false);

      const deleteRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'delete' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'nonexistent' } });
      const res = createMockResponse();

      await deleteRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'API key not found' });
    });

    it('should return 401 if user is not authenticated', async () => {
      const deleteRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'delete' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ auth: undefined, params: { id: 'key-123' } });
      const res = createMockResponse();

      await deleteRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 500 on store error', async () => {
      mockStore.delete.mockRejectedValue(new Error('Database error'));

      const deleteRoute = mockRegistry.addRoute.mock.calls.find(
        call => call[0].method === 'delete' && call[0].path === '/api-keys/:id'
      );

      const req = createMockRequest({ params: { id: 'key-123' } });
      const res = createMockResponse();

      await deleteRoute![0].handler(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete API key' });
    });
  });
});

// ========================================
// Helper Functions Tests
// ========================================

describe('API Keys Plugin - Helper Functions', () => {
  let mockRegistry: MockPluginRegistry;
  let mockStore: MockApiKeyStore;
  let plugin: Plugin;

  beforeEach(async () => {
    mockRegistry = createMockRegistry();
    mockStore = createMockStore();
    mockRegistry.hasPlugin.mockReturnValue(true);

    const config: ApiKeysPluginConfig = {
      store: mockStore as unknown as ApiKeyStore,
    };

    plugin = createApiKeysPlugin(config);
    await plugin.onStart?.({}, mockRegistry as unknown as PluginRegistry);
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  describe('getApiKeysStore', () => {
    it('should return the current store instance', () => {
      const store = getApiKeysStore();
      expect(store).toBe(mockStore);
    });

    it('should return null after plugin stops', async () => {
      await plugin.onStop?.();
      const store = getApiKeysStore();
      expect(store).toBeNull();
    });
  });

  describe('verifyApiKey', () => {
    it('should verify API key and record usage', async () => {
      const mockKey = createMockApiKey();
      mockStore.verify.mockResolvedValue(mockKey);

      const result = await verifyApiKey('qk_test_validkey123');

      expect(mockStore.verify).toHaveBeenCalledWith('qk_test_validkey123');
      expect(mockStore.recordUsage).toHaveBeenCalledWith('key-123');
      expect(result).toEqual(mockKey);
    });

    it('should return null for invalid key', async () => {
      mockStore.verify.mockResolvedValue(null);

      const result = await verifyApiKey('qk_test_invalidkey');

      expect(result).toBeNull();
      expect(mockStore.recordUsage).not.toHaveBeenCalled();
    });

    it('should continue if recordUsage fails', async () => {
      const mockKey = createMockApiKey();
      mockStore.verify.mockResolvedValue(mockKey);
      mockStore.recordUsage.mockRejectedValue(new Error('Usage recording failed'));

      const result = await verifyApiKey('qk_test_validkey123');

      expect(result).toEqual(mockKey);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(verifyApiKey('qk_test_key')).rejects.toThrow(
        'API Keys plugin not initialized'
      );
    });
  });

  describe('createApiKey', () => {
    it('should create API key via store', async () => {
      const mockKey = createMockApiKey();
      mockStore.create.mockResolvedValue(mockKey);

      const params = {
        user_id: 'user-123',
        name: 'Test Key',
        key_type: 'pat' as const,
        scopes: ['read' as const, 'write' as const],
      };

      const result = await createApiKey(params);

      expect(mockStore.create).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockKey);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(
        createApiKey({
          user_id: 'user-123',
          name: 'Test',
          key_type: 'pat',
          scopes: ['read'],
        })
      ).rejects.toThrow('API Keys plugin not initialized');
    });
  });

  describe('listApiKeys', () => {
    it('should list API keys via store', async () => {
      const mockKeys = [createMockApiKey()];
      mockStore.list.mockResolvedValue(mockKeys);

      const result = await listApiKeys('user-123');

      expect(mockStore.list).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockKeys);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(listApiKeys('user-123')).rejects.toThrow(
        'API Keys plugin not initialized'
      );
    });
  });

  describe('getApiKey', () => {
    it('should get API key via store', async () => {
      const mockKey = createMockApiKey();
      mockStore.get.mockResolvedValue(mockKey);

      const result = await getApiKey('user-123', 'key-123');

      expect(mockStore.get).toHaveBeenCalledWith('user-123', 'key-123');
      expect(result).toEqual(mockKey);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(getApiKey('user-123', 'key-123')).rejects.toThrow(
        'API Keys plugin not initialized'
      );
    });
  });

  describe('updateApiKey', () => {
    it('should update API key via store', async () => {
      const mockKey = createMockApiKey({ name: 'Updated' });
      mockStore.update.mockResolvedValue(mockKey);

      const result = await updateApiKey('user-123', 'key-123', { name: 'Updated' });

      expect(mockStore.update).toHaveBeenCalledWith('user-123', 'key-123', { name: 'Updated' });
      expect(result).toEqual(mockKey);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(updateApiKey('user-123', 'key-123', { name: 'Updated' })).rejects.toThrow(
        'API Keys plugin not initialized'
      );
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key via store', async () => {
      mockStore.delete.mockResolvedValue(true);

      const result = await deleteApiKey('user-123', 'key-123');

      expect(mockStore.delete).toHaveBeenCalledWith('user-123', 'key-123');
      expect(result).toBe(true);
    });

    it('should throw error if store is not initialized', async () => {
      await plugin.onStop?.();

      await expect(deleteApiKey('user-123', 'key-123')).rejects.toThrow(
        'API Keys plugin not initialized'
      );
    });
  });
});
