/**
 * Guards Test Suite
 *
 * Tests for route guard middleware, including session cookie functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createRouteGuard } from '../src/core/guards.js';

describe('Route Guards', () => {
  describe('Basic Auth Guard', () => {
    const config = {
      type: 'basic' as const,
      username: 'admin',
      password: 'secret123',
      realm: 'Test Realm',
      excludePaths: ['/api/health'],
    };

    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFn: NextFunction;
    let setCookieValue: string | undefined;

    beforeEach(() => {
      mockReq = {
        path: '/cpanel',
        headers: {},
      };

      setCookieValue = undefined;
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn((name: string, value: string) => {
          if (name === 'Set-Cookie') {
            setCookieValue = value;
          }
          return mockRes as Response;
        }),
      };

      nextFn = vi.fn();
    });

    it('should allow access with valid Basic Auth and set session cookie', () => {
      const guard = createRouteGuard(config);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(setCookieValue).toBeDefined();
      expect(setCookieValue).toContain('cpanel_session=');
      expect(setCookieValue).toContain('HttpOnly');
      expect(setCookieValue).toContain('SameSite=Strict');
    });

    it('should deny access without credentials', () => {
      const guard = createRouteGuard(config);

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    });

    it('should deny access with invalid credentials', () => {
      const guard = createRouteGuard(config);
      const invalidAuth = `Basic ${Buffer.from('admin:wrong').toString('base64')}`;
      mockReq.headers = { authorization: invalidAuth };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should allow access with valid session cookie', () => {
      const guard = createRouteGuard(config);

      // First, get a valid session cookie by authenticating
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };
      guard(mockReq as Request, mockRes as Response, nextFn);

      // Extract the session token from Set-Cookie header
      const sessionToken = setCookieValue?.split(';')[0].split('=')[1];
      expect(sessionToken).toBeDefined();

      // Reset mocks
      vi.clearAllMocks();
      setCookieValue = undefined;

      // Now try to access with just the session cookie (no auth header)
      mockReq.headers = {
        cookie: `cpanel_session=${sessionToken}`,
      };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      // Should NOT set a new cookie since session is still valid
      expect(setCookieValue).toBeUndefined();
    });

    it('should deny access with invalid session cookie', () => {
      const guard = createRouteGuard(config);
      mockReq.headers = {
        cookie: 'cpanel_session=invalid:token:signature',
      };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should deny access with expired session cookie', () => {
      const guard = createRouteGuard(config);

      // Create a manually crafted expired token
      const expiredTimestamp = Date.now() - 1000; // 1 second ago
      const expiredToken = `cpanel:${expiredTimestamp}:fakesignature`;
      mockReq.headers = {
        cookie: `cpanel_session=${expiredToken}`,
      };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should exclude paths from authentication', () => {
      const guard = createRouteGuard(config);
      mockReq.path = '/api/health';
      mockReq.headers = {}; // No auth

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });

    it('should set WWW-Authenticate header on 401', () => {
      const guard = createRouteGuard(config);

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Basic realm="Test Realm"'
      );
    });

    it('should add Secure flag when request is over HTTPS', () => {
      const guard = createRouteGuard(config);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };
      mockReq.secure = true;

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(setCookieValue).toContain('Secure');
    });

    it('should add Secure flag when x-forwarded-proto is https', () => {
      const guard = createRouteGuard(config);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth, 'x-forwarded-proto': 'https' };
      mockReq.secure = false;

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(setCookieValue).toContain('Secure');
    });

    it('should not add Secure flag for HTTP requests', () => {
      const guard = createRouteGuard(config);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };
      mockReq.secure = false;

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(setCookieValue).not.toContain('Secure');
    });

    it('should use custom session duration when configured', () => {
      const customConfig = {
        ...config,
        sessionDurationHours: 24,
      };
      const guard = createRouteGuard(customConfig);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      // Max-Age should be 24 hours = 86400 seconds
      expect(setCookieValue).toContain('Max-Age=86400');
    });

    it('should use default 8-hour session duration when not configured', () => {
      const guard = createRouteGuard(config);
      const validAuth = `Basic ${Buffer.from('admin:secret123').toString('base64')}`;
      mockReq.headers = { authorization: validAuth };

      guard(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
      // Max-Age should be 8 hours = 28800 seconds
      expect(setCookieValue).toContain('Max-Age=28800');
    });
  });

  describe('None Guard', () => {
    it('should always allow access', () => {
      const guard = createRouteGuard({ type: 'none' });
      const mockReq = { path: '/any' } as Request;
      const mockRes = {} as Response;
      const nextFn = vi.fn();

      guard(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });
  });
});
