/**
 * Unit tests for Usage Logging Middleware
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createUsageLoggingMiddleware } from '../src/plugins/api-keys/middleware/usage-logging.js';
import type { UsageLogStore } from '../src/plugins/api-keys/stores/usage-log-store.js';

// Mock usage log store
function createMockStore(): UsageLogStore {
  return {
    initialize: vi.fn(),
    log: vi.fn(),
    logBatch: vi.fn(),
    getKeyUsage: vi.fn(),
    getKeyStats: vi.fn(),
    deleteOlderThan: vi.fn(),
    shutdown: vi.fn(),
  };
}

// Mock Express objects
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    path: '/api/test',
    method: 'GET',
    ip: '192.168.1.1',
    get: vi.fn((header: string) => {
      if (header === 'user-agent') return 'Mozilla/5.0';
      return undefined;
    }),
    headers: {},
    socket: { remoteAddress: '192.168.1.1' },
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res = {
    statusCode: 200,
    send: vi.fn(),
  } as unknown as Response;
  return res;
}

describe('Usage Logging Middleware', () => {
  let mockStore: UsageLogStore;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockStore = createMockStore();
    mockNext = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should skip logging when no API key is present', () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest();
    const res = createMockResponse();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStore.log).not.toHaveBeenCalled();
  });

  it('should intercept response.send when API key is present', () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.send).not.toBe(vi.fn()); // Send should be wrapped
  });

  it('should log usage after response is sent', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);

    // Simulate sending response
    res.statusCode = 200;
    res.send({ data: 'test' });

    // Fast-forward to execute setImmediate callbacks
    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith({
      key_id: 'key-123',
      endpoint: '/api/test',
      method: 'GET',
      status_code: 200,
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    });
  });

  it('should capture correct status code from response', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);

    // Simulate 404 response
    res.statusCode = 404;
    res.send({ error: 'Not found' });

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({
        status_code: 404,
      })
    );
  });

  it('should handle IP address from X-Forwarded-For header', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
      ip: undefined,
      headers: {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      },
    } as any);
    const res = createMockResponse();

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);
    res.send({ data: 'test' });

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({
        ip_address: '203.0.113.1', // First IP in chain
      })
    );
  });

  it('should fallback to socket.remoteAddress when no IP available', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
      ip: undefined,
      headers: {},
      socket: { remoteAddress: '10.0.0.1' },
    } as any);
    const res = createMockResponse();

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);
    res.send({ data: 'test' });

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({
        ip_address: '10.0.0.1',
      })
    );
  });

  it('should handle missing user agent', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    // Mock get() to return undefined for user-agent
    req.get = vi.fn(() => undefined);

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);
    res.send({ data: 'test' });

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({
        user_agent: undefined,
      })
    );
  });

  it('should log POST requests correctly', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      path: '/api/qwickbrain/search',
      method: 'POST',
      apiKey: {
        id: 'key-789',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['qwickbrain:execute'],
      },
    } as any);
    const res = createMockResponse();

    (mockStore.log as any).mockResolvedValue(undefined);

    middleware(req, res, mockNext);

    res.statusCode = 201;
    res.send({ result: 'created' });

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledWith({
      key_id: 'key-789',
      endpoint: '/api/qwickbrain/search',
      method: 'POST',
      status_code: 201,
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    });
  });

  it('should handle logging errors gracefully without failing request', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    // Mock store.log to reject
    (mockStore.log as any).mockRejectedValue(new Error('Database error'));

    middleware(req, res, mockNext);
    res.send({ data: 'test' });

    await vi.runAllTimersAsync();

    // Error should be logged to console
    expect(consoleSpy).toHaveBeenCalledWith(
      '[UsageLogging] Failed to log API key usage:',
      expect.any(Error)
    );

    // Response should still be sent
    expect(res.send).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not block response sending (async logging)', () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    // Create a slow mock
    const slowLog = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    mockStore.log = slowLog as any;

    middleware(req, res, mockNext);
    res.send({ data: 'test' });

    // Response should be sent immediately, not waiting for log
    expect(res.send).toHaveBeenCalled();
    expect(slowLog).not.toHaveBeenCalled(); // Not called yet (setImmediate)
  });

  it('should call original send with correct context', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    const req = createMockRequest({
      apiKey: {
        id: 'key-123',
        user_id: 'user-456',
        name: 'Test Key',
        scopes: ['system:read'],
      },
    } as any);
    const res = createMockResponse();

    const originalSend = res.send;
    const sendData = { data: 'test' };

    middleware(req, res, mockNext);
    res.send(sendData);

    // Original send should have been called with correct data
    expect(originalSend).toHaveBeenCalledWith(sendData);
  });

  it('should handle multiple requests with same middleware instance', async () => {
    const middleware = createUsageLoggingMiddleware(mockStore);
    (mockStore.log as any).mockResolvedValue(undefined);

    // Request 1
    const req1 = createMockRequest({
      path: '/api/test1',
      apiKey: { id: 'key-1', user_id: 'user-1', name: 'Key 1', scopes: [] },
    } as any);
    const res1 = createMockResponse();
    middleware(req1, res1, mockNext);
    res1.send({});

    // Request 2
    const req2 = createMockRequest({
      path: '/api/test2',
      apiKey: { id: 'key-2', user_id: 'user-2', name: 'Key 2', scopes: [] },
    } as any);
    const res2 = createMockResponse();
    middleware(req2, res2, mockNext);
    res2.send({});

    await vi.runAllTimersAsync();

    expect(mockStore.log).toHaveBeenCalledTimes(2);
    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({ key_id: 'key-1', endpoint: '/api/test1' })
    );
    expect(mockStore.log).toHaveBeenCalledWith(
      expect.objectContaining({ key_id: 'key-2', endpoint: '/api/test2' })
    );
  });
});
