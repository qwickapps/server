/**
 * API Keys Phase 2 Endpoint Tests
 *
 * Integration tests for Phase 2 endpoints:
 * - GET /scopes - List all available scopes
 * - GET /api-keys/:id/usage - Get usage logs and stats
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { Plugin, PluginRegistry } from '../src/core/plugin-registry.js';
import type {
  ApiKeyStore,
  ApiKey,
  ApiKeysPluginConfig,
} from '../src/plugins/api-keys/types.js';
import type { AuthenticatedRequest } from '../src/plugins/auth/types.js';
import type { PluginScopeStore, PluginScope } from '../src/plugins/api-keys/stores/plugin-scope-store.js';
import type { UsageLogStore, UsageLogEntry, UsageLogStats } from '../src/plugins/api-keys/stores/usage-log-store.js';
import { createApiKeysPlugin } from '../src/plugins/api-keys/api-keys-plugin.js';

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

type MockScopeStore = {
  initialize: ReturnType<typeof vi.fn>;
  registerScopes: ReturnType<typeof vi.fn>;
  getAllScopes: ReturnType<typeof vi.fn>;
  getPluginScopes: ReturnType<typeof vi.fn>;
  isValidScope: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
};

type MockUsageStore = {
  initialize: ReturnType<typeof vi.fn>;
  log: ReturnType<typeof vi.fn>;
  logBatch: ReturnType<typeof vi.fn>;
  getKeyUsage: ReturnType<typeof vi.fn>;
  getKeyStats: ReturnType<typeof vi.fn>;
  deleteOlderThan: ReturnType<typeof vi.fn>;
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

function createMockScopeStore(): MockScopeStore {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    registerScopes: vi.fn().mockResolvedValue(undefined),
    getAllScopes: vi.fn().mockResolvedValue([]),
    getPluginScopes: vi.fn().mockResolvedValue([]),
    isValidScope: vi.fn().mockResolvedValue(false),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockUsageStore(): MockUsageStore {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    log: vi.fn().mockResolvedValue(undefined),
    logBatch: vi.fn().mockResolvedValue(undefined),
    getKeyUsage: vi.fn().mockResolvedValue([]),
    getKeyStats: vi.fn().mockResolvedValue({
      totalCalls: 0,
      lastUsed: null,
      callsByStatus: {},
      callsByEndpoint: {},
    }),
    deleteOlderThan: vi.fn().mockResolvedValue(0),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockRequest(overrides: MockRequest = {}): MockRequest {
  return {
    params: {},
    query: {},
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

// ========================================
// Tests
// ========================================

describe('API Keys Phase 2 Endpoints', () => {
  let mockRegistry: MockPluginRegistry;
  let mockStore: MockApiKeyStore;
  let mockScopeStore: MockScopeStore;
  let mockUsageStore: MockUsageStore;
  let plugin: Plugin;
  let scopesRouteHandler: (req: Request, res: Response) => Promise<void>;
  let usageRouteHandler: (req: Request, res: Response) => Promise<void>;

  beforeEach(async () => {
    mockRegistry = createMockRegistry();
    mockStore = createMockStore();
    mockScopeStore = createMockScopeStore();
    mockUsageStore = createMockUsageStore();

    mockRegistry.hasPlugin.mockReturnValue(true); // Users plugin exists

    const config: ApiKeysPluginConfig = {
      store: mockStore as unknown as ApiKeyStore,
      scopeStore: mockScopeStore as unknown as PluginScopeStore,
      usageStore: mockUsageStore as unknown as UsageLogStore,
      api: { enabled: true },
    };

    plugin = createApiKeysPlugin(config);
    await plugin.onStart?.({} as any, mockRegistry as unknown as PluginRegistry);

    // Extract route handlers
    const scopesRoute = (mockRegistry.addRoute as any).mock.calls.find(
      (call: any[]) => call[0].path === '/scopes' && call[0].method === 'get'
    );
    const usageRoute = (mockRegistry.addRoute as any).mock.calls.find(
      (call: any[]) => call[0].path === '/api-keys/:id/usage' && call[0].method === 'get'
    );

    scopesRouteHandler = scopesRoute?.[0].handler;
    usageRouteHandler = usageRoute?.[0].handler;
  });

  afterEach(async () => {
    await plugin.onStop?.();
    vi.clearAllMocks();
  });

  describe('GET /scopes', () => {
    it('should return all scopes grouped by plugin', async () => {
      const mockScopes: PluginScope[] = [
        {
          name: 'system:read',
          plugin_id: 'system',
          description: 'System read access',
          category: 'read',
        },
        {
          name: 'system:write',
          plugin_id: 'system',
          description: 'System write access',
          category: 'write',
        },
        {
          name: 'qwickbrain:read',
          plugin_id: 'qwickbrain',
          description: 'Read QwickBrain data',
          category: 'read',
        },
        {
          name: 'qwickbrain:execute',
          plugin_id: 'qwickbrain',
          description: 'Execute QwickBrain tools',
          category: 'write',
        },
      ];

      mockScopeStore.getAllScopes.mockResolvedValue(mockScopes);

      const req = createMockRequest();
      const res = createMockResponse();

      await scopesRouteHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        scopes: [
          {
            pluginId: 'system',
            scopes: [
              {
                name: 'system:read',
                description: 'System read access',
                category: 'read',
              },
              {
                name: 'system:write',
                description: 'System write access',
                category: 'write',
              },
            ],
          },
          {
            pluginId: 'qwickbrain',
            scopes: [
              {
                name: 'qwickbrain:read',
                description: 'Read QwickBrain data',
                category: 'read',
              },
              {
                name: 'qwickbrain:execute',
                description: 'Execute QwickBrain tools',
                category: 'write',
              },
            ],
          },
        ],
      });
    });

    it('should return empty array when no scopes exist', async () => {
      mockScopeStore.getAllScopes.mockResolvedValue([]);

      const req = createMockRequest();
      const res = createMockResponse();

      await scopesRouteHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({ scopes: [] });
    });

    it('should handle store errors gracefully', async () => {
      mockScopeStore.getAllScopes.mockRejectedValue(new Error('Database error'));

      const req = createMockRequest();
      const res = createMockResponse();

      await scopesRouteHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve scopes' });
    });
  });

  describe('GET /api-keys/:id/usage', () => {
    const mockKey: ApiKey = {
      id: 'key-123',
      user_id: 'user-123',
      name: 'Test Key',
      key_prefix: 'qwk_test',
      key_type: 'standard',
      key_hash: 'hash',
      scopes: ['system:read'],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return usage logs and stats for a valid key', async () => {
      const mockLogs: UsageLogEntry[] = [
        {
          id: '1',
          key_id: 'key-123',
          endpoint: '/api/test',
          method: 'GET',
          status_code: 200,
          ip_address: '192.168.1.1',
          timestamp: new Date('2025-12-26T10:00:00Z'),
        },
        {
          id: '2',
          key_id: 'key-123',
          endpoint: '/api/test2',
          method: 'POST',
          status_code: 201,
          ip_address: '192.168.1.1',
          timestamp: new Date('2025-12-26T11:00:00Z'),
        },
      ];

      const mockStats: UsageLogStats = {
        totalCalls: 150,
        lastUsed: new Date('2025-12-26T11:00:00Z'),
        callsByStatus: { '200': 120, '201': 20, '404': 10 },
        callsByEndpoint: { '/api/test': 100, '/api/test2': 50 },
      };

      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue(mockLogs);
      mockUsageStore.getKeyStats.mockResolvedValue(mockStats);

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: {},
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockStore.get).toHaveBeenCalledWith('user-123', 'key-123');
      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith('key-123', {
        limit: 100,
        offset: 0,
        since: undefined,
        until: undefined,
        endpoint: undefined,
        method: undefined,
        statusCode: undefined,
      });
      expect(mockUsageStore.getKeyStats).toHaveBeenCalledWith('key-123', {
        since: undefined,
        until: undefined,
      });

      expect(res.json).toHaveBeenCalledWith({
        keyId: 'key-123',
        keyName: 'Test Key',
        totalCalls: 150,
        lastUsed: mockStats.lastUsed,
        callsByStatus: { '200': 120, '201': 20, '404': 10 },
        callsByEndpoint: { '/api/test': 100, '/api/test2': 50 },
        logs: mockLogs,
      });
    });

    it('should support pagination with limit and offset', async () => {
      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue([]);
      mockUsageStore.getKeyStats.mockResolvedValue({
        totalCalls: 0,
        lastUsed: null,
        callsByStatus: {},
        callsByEndpoint: {},
      });

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: { limit: '50', offset: '100' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          limit: 50,
          offset: 100,
        })
      );
    });

    it('should support date range filtering', async () => {
      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue([]);
      mockUsageStore.getKeyStats.mockResolvedValue({
        totalCalls: 0,
        lastUsed: null,
        callsByStatus: {},
        callsByEndpoint: {},
      });

      const since = '2025-12-01T00:00:00Z';
      const until = '2025-12-31T23:59:59Z';

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: { since, until },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          since: new Date(since),
          until: new Date(until),
        })
      );
    });

    it('should support endpoint filtering', async () => {
      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue([]);
      mockUsageStore.getKeyStats.mockResolvedValue({
        totalCalls: 0,
        lastUsed: null,
        callsByStatus: {},
        callsByEndpoint: {},
      });

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: { endpoint: '/api/qwickbrain' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          endpoint: '/api/qwickbrain',
        })
      );
    });

    it('should support method filtering', async () => {
      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue([]);
      mockUsageStore.getKeyStats.mockResolvedValue({
        totalCalls: 0,
        lastUsed: null,
        callsByStatus: {},
        callsByEndpoint: {},
      });

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: { method: 'POST' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should support status code filtering', async () => {
      mockStore.get.mockResolvedValue(mockKey);
      mockUsageStore.getKeyUsage.mockResolvedValue([]);
      mockUsageStore.getKeyStats.mockResolvedValue({
        totalCalls: 0,
        lastUsed: null,
        callsByStatus: {},
        callsByEndpoint: {},
      });

      const req = createMockRequest({
        params: { id: 'key-123' },
        query: { statusCode: '404' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(mockUsageStore.getKeyUsage).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          statusCode: 404,
        })
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockRequest({
        params: { id: 'key-123' },
        auth: undefined,
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 404 when key does not exist', async () => {
      mockStore.get.mockResolvedValue(null);

      const req = createMockRequest({
        params: { id: 'key-nonexistent' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'API key not found' });
    });

    it('should return 404 when key belongs to different user', async () => {
      mockStore.get.mockResolvedValue(null); // RLS would return null

      const req = createMockRequest({
        params: { id: 'key-other-user' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'API key not found' });
    });

    it('should handle store errors gracefully', async () => {
      mockStore.get.mockRejectedValue(new Error('Database error'));

      const req = createMockRequest({
        params: { id: 'key-123' },
      });
      const res = createMockResponse();

      await usageRouteHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve usage logs' });
    });
  });
});
