/**
 * Auth Adapter Wrapper Tests
 *
 * Unit tests for the hot-reload adapter wrapper.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createAdapterWrapper } from './adapter-wrapper.js';
import type { AuthAdapter, AuthenticatedUser } from './types.js';

// Helper to create a mock adapter
function createMockAdapter(name: string, overrides: Partial<AuthAdapter> = {}): AuthAdapter {
  return {
    name,
    initialize: vi.fn().mockReturnValue((_req: Request, _res: Response, next: NextFunction) => next()),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getUser: vi.fn().mockReturnValue(null),
    hasRoles: vi.fn().mockReturnValue(false),
    getAccessToken: vi.fn().mockReturnValue(null),
    onUnauthorized: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Helper to create mock request/response
function createMockReq(): Request {
  return {} as Request;
}

function createMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('createAdapterWrapper', () => {
  describe('initialization', () => {
    it('should create wrapper with no-op adapter by default', () => {
      const wrapper = createAdapterWrapper();

      expect(wrapper.name).toBe('none');
      expect(wrapper.hasAdapter()).toBe(false);
    });

    it('should create wrapper with initial adapter', () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);

      expect(wrapper.name).toBe('test');
      expect(wrapper.hasAdapter()).toBe(true);
    });

    it('should return adapter info', () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);

      const info = wrapper.getAdapterInfo();

      expect(info.name).toBe('test');
      expect(info.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should call underlying adapter initialize', () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);

      wrapper.initialize();

      expect(mockAdapter.initialize).toHaveBeenCalled();
    });

    it('should mark wrapper as initialized', () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);

      wrapper.initialize();

      expect(wrapper.getAdapterInfo().initialized).toBe(true);
    });

    it('should return middleware from underlying adapter', () => {
      const mockMiddleware = vi.fn();
      const mockAdapter = createMockAdapter('test', {
        initialize: vi.fn().mockReturnValue(mockMiddleware),
      });
      const wrapper = createAdapterWrapper(mockAdapter);

      const result = wrapper.initialize();

      expect(result).toBe(mockMiddleware);
    });
  });

  describe('isAuthenticated', () => {
    it('should delegate to current adapter', () => {
      const mockAdapter = createMockAdapter('test', {
        isAuthenticated: vi.fn().mockReturnValue(true),
      });
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      const result = wrapper.isAuthenticated(req);

      expect(mockAdapter.isAuthenticated).toHaveBeenCalledWith(req);
      expect(result).toBe(true);
    });

    it('should use new adapter after swap', async () => {
      const oldAdapter = createMockAdapter('old', {
        isAuthenticated: vi.fn().mockReturnValue(false),
      });
      const newAdapter = createMockAdapter('new', {
        isAuthenticated: vi.fn().mockReturnValue(true),
      });

      const wrapper = createAdapterWrapper(oldAdapter);
      await wrapper.setAdapter(newAdapter);

      const req = createMockReq();
      const result = wrapper.isAuthenticated(req);

      expect(result).toBe(true);
      expect(newAdapter.isAuthenticated).toHaveBeenCalledWith(req);
    });
  });

  describe('getUser', () => {
    it('should delegate to current adapter', () => {
      const mockUser: AuthenticatedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockAdapter = createMockAdapter('test', {
        getUser: vi.fn().mockReturnValue(mockUser),
      });
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      const result = wrapper.getUser(req);

      expect(mockAdapter.getUser).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockUser);
    });

    it('should return null for no-op adapter', () => {
      const wrapper = createAdapterWrapper();
      const req = createMockReq();

      const result = wrapper.getUser(req);

      expect(result).toBeNull();
    });
  });

  describe('hasRoles', () => {
    it('should delegate to current adapter if method exists', () => {
      const mockAdapter = createMockAdapter('test', {
        hasRoles: vi.fn().mockReturnValue(true),
      });
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      // Wrapper always implements hasRoles
      const result = wrapper.hasRoles!(req, ['admin']);

      expect(mockAdapter.hasRoles).toHaveBeenCalledWith(req, ['admin']);
      expect(result).toBe(true);
    });

    it('should return false if adapter has no hasRoles method', () => {
      const mockAdapter = createMockAdapter('test');
      delete (mockAdapter as Partial<AuthAdapter>).hasRoles;
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      // Wrapper always implements hasRoles, even if underlying adapter doesn't
      const result = wrapper.hasRoles!(req, ['admin']);

      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should delegate to current adapter if method exists', () => {
      const mockAdapter = createMockAdapter('test', {
        getAccessToken: vi.fn().mockReturnValue('token123'),
      });
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      // Wrapper always implements getAccessToken
      const result = wrapper.getAccessToken!(req);

      expect(mockAdapter.getAccessToken).toHaveBeenCalledWith(req);
      expect(result).toBe('token123');
    });

    it('should return null if adapter has no getAccessToken method', () => {
      const mockAdapter = createMockAdapter('test');
      delete (mockAdapter as Partial<AuthAdapter>).getAccessToken;
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();

      // Wrapper always implements getAccessToken, returns null when adapter doesn't have it
      const result = wrapper.getAccessToken!(req);

      expect(result).toBeNull();
    });
  });

  describe('onUnauthorized', () => {
    it('should delegate to current adapter if method exists', () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();
      const res = createMockRes();

      // Wrapper always implements onUnauthorized
      wrapper.onUnauthorized!(req, res);

      expect(mockAdapter.onUnauthorized).toHaveBeenCalledWith(req, res);
    });

    it('should return 401 JSON response if adapter has no onUnauthorized', () => {
      const mockAdapter = createMockAdapter('test');
      delete (mockAdapter as Partial<AuthAdapter>).onUnauthorized;
      const wrapper = createAdapterWrapper(mockAdapter);
      const req = createMockReq();
      const res = createMockRes();

      // Wrapper always implements onUnauthorized with default behavior
      wrapper.onUnauthorized!(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });
  });

  describe('setAdapter (hot-reload)', () => {
    it('should swap adapter successfully', async () => {
      const oldAdapter = createMockAdapter('old');
      const newAdapter = createMockAdapter('new');
      const wrapper = createAdapterWrapper(oldAdapter);

      await wrapper.setAdapter(newAdapter);

      expect(wrapper.name).toBe('new');
    });

    it('should shutdown old adapter before swap', async () => {
      const oldAdapter = createMockAdapter('old');
      const newAdapter = createMockAdapter('new');
      const wrapper = createAdapterWrapper(oldAdapter);

      await wrapper.setAdapter(newAdapter);

      expect(oldAdapter.shutdown).toHaveBeenCalled();
    });

    it('should initialize new adapter if wrapper was initialized', async () => {
      const oldAdapter = createMockAdapter('old');
      const newAdapter = createMockAdapter('new');
      const wrapper = createAdapterWrapper(oldAdapter);

      // Initialize wrapper
      wrapper.initialize();

      // Swap adapter
      await wrapper.setAdapter(newAdapter);

      expect(newAdapter.initialize).toHaveBeenCalled();
    });

    it('should not initialize new adapter if wrapper was not initialized', async () => {
      const oldAdapter = createMockAdapter('old');
      const newAdapter = createMockAdapter('new');
      const wrapper = createAdapterWrapper(oldAdapter);

      // Don't initialize wrapper

      // Swap adapter
      await wrapper.setAdapter(newAdapter);

      expect(newAdapter.initialize).not.toHaveBeenCalled();
    });

    it('should prevent concurrent adapter swaps', async () => {
      const oldAdapter = createMockAdapter('old', {
        shutdown: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100))),
      });
      const newAdapter1 = createMockAdapter('new1');
      const newAdapter2 = createMockAdapter('new2');
      const wrapper = createAdapterWrapper(oldAdapter);

      // Start first swap
      const swap1 = wrapper.setAdapter(newAdapter1);

      // Try second swap immediately (should fail)
      await expect(wrapper.setAdapter(newAdapter2)).rejects.toThrow('Adapter swap already in progress');

      // Wait for first swap to complete
      await swap1;

      // Now second swap should work
      await wrapper.setAdapter(newAdapter2);
      expect(wrapper.name).toBe('new2');
    });

    it('should handle shutdown errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const oldAdapter = createMockAdapter('old', {
        shutdown: vi.fn().mockRejectedValue(new Error('Shutdown failed')),
      });
      const newAdapter = createMockAdapter('new');
      const wrapper = createAdapterWrapper(oldAdapter);

      // Should not throw
      await wrapper.setAdapter(newAdapter);

      expect(wrapper.name).toBe('new');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AdapterWrapper] Error shutting down old adapter:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('shutdown', () => {
    it('should shutdown current adapter', async () => {
      const mockAdapter = createMockAdapter('test');
      const wrapper = createAdapterWrapper(mockAdapter);
      wrapper.initialize();

      // Wrapper always implements shutdown
      await wrapper.shutdown!();

      expect(mockAdapter.shutdown).toHaveBeenCalled();
      expect(wrapper.getAdapterInfo().initialized).toBe(false);
    });

    it('should handle adapters without shutdown method', async () => {
      const mockAdapter = createMockAdapter('test');
      delete (mockAdapter as Partial<AuthAdapter>).shutdown;
      const wrapper = createAdapterWrapper(mockAdapter);
      wrapper.initialize();

      // Should not throw - wrapper handles missing shutdown gracefully
      await wrapper.shutdown!();

      expect(wrapper.getAdapterInfo().initialized).toBe(false);
    });
  });

  describe('no-op adapter', () => {
    it('should return false for isAuthenticated', () => {
      const wrapper = createAdapterWrapper();
      const req = createMockReq();

      expect(wrapper.isAuthenticated(req)).toBe(false);
    });

    it('should return null for getUser', () => {
      const wrapper = createAdapterWrapper();
      const req = createMockReq();

      expect(wrapper.getUser(req)).toBeNull();
    });

    it('should return middleware that calls next', () => {
      const wrapper = createAdapterWrapper();
      const middleware = wrapper.initialize();

      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      if (typeof middleware === 'function') {
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
      }
    });
  });
});
