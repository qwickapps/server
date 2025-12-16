/**
 * Auth Adapter Wrapper
 *
 * Wraps an auth adapter to enable hot-reload without server restart.
 * All method calls are delegated to the underlying adapter, which can
 * be swapped at runtime via setAdapter().
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, RequestHandler } from 'express';
import type { AuthAdapter, AuthenticatedUser } from './types.js';

/**
 * Extended adapter interface with hot-reload capabilities
 */
export interface AdapterWrapper extends AuthAdapter {
  /**
   * Replace the underlying adapter (for hot-reload)
   * Calls shutdown() on the old adapter before swapping
   */
  setAdapter(adapter: AuthAdapter): Promise<void>;

  /**
   * Get information about the current adapter
   */
  getAdapterInfo(): { name: string; initialized: boolean };

  /**
   * Check if an adapter is currently set
   */
  hasAdapter(): boolean;
}

/**
 * Create a no-op adapter for when auth is disabled
 */
function createNoopAdapter(): AuthAdapter {
  return {
    name: 'none',
    initialize: () => ((_req, _res, next) => next()) as RequestHandler,
    isAuthenticated: () => false,
    getUser: () => null,
  };
}

/**
 * Create an adapter wrapper for hot-reload support
 *
 * @param initialAdapter Optional initial adapter (defaults to no-op)
 * @returns AdapterWrapper that delegates to the underlying adapter
 *
 * @example
 * ```ts
 * const wrapper = createAdapterWrapper(supertokensAdapter(config));
 *
 * // Later, swap the adapter without restart:
 * await wrapper.setAdapter(auth0Adapter(newConfig));
 * ```
 */
export function createAdapterWrapper(initialAdapter?: AuthAdapter): AdapterWrapper {
  let currentAdapter: AuthAdapter = initialAdapter || createNoopAdapter();
  let isInitialized = false;
  let isSwapping = false; // Prevent concurrent adapter swaps

  return {
    // Delegate name to current adapter
    get name(): string {
      return currentAdapter.name;
    },

    /**
     * Initialize returns the middleware
     * Note: This is called once at startup. The middleware itself
     * will delegate to currentAdapter, which can be swapped.
     */
    initialize(): RequestHandler | RequestHandler[] {
      isInitialized = true;

      // Get the initial middleware
      const initialMiddleware = currentAdapter.initialize();

      // Return a wrapper middleware that delegates to current adapter's middleware
      // This allows hot-reload to work - new adapter's middleware will be used
      // Note: For simplicity, we return the initial middleware. Full hot-reload
      // of middleware would require more complex Express route manipulation.
      // The key hot-reload capability is in isAuthenticated/getUser which ARE
      // delegated dynamically.
      return initialMiddleware;
    },

    /**
     * Delegate isAuthenticated to current adapter
     */
    isAuthenticated(req: Request): boolean {
      return currentAdapter.isAuthenticated(req);
    },

    /**
     * Delegate getUser to current adapter
     */
    getUser(req: Request): AuthenticatedUser | null | Promise<AuthenticatedUser | null> {
      return currentAdapter.getUser(req);
    },

    /**
     * Delegate hasRoles to current adapter (if available)
     */
    hasRoles(req: Request, roles: string[]): boolean {
      if (currentAdapter.hasRoles) {
        return currentAdapter.hasRoles(req, roles);
      }
      return false;
    },

    /**
     * Delegate getAccessToken to current adapter (if available)
     */
    getAccessToken(req: Request): string | null {
      if (currentAdapter.getAccessToken) {
        return currentAdapter.getAccessToken(req);
      }
      return null;
    },

    /**
     * Delegate onUnauthorized to current adapter (if available)
     */
    onUnauthorized(req: Request, res: Response): void {
      if (currentAdapter.onUnauthorized) {
        currentAdapter.onUnauthorized(req, res);
      } else {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }
    },

    /**
     * Shutdown the current adapter
     */
    async shutdown(): Promise<void> {
      if (currentAdapter.shutdown) {
        await currentAdapter.shutdown();
      }
      isInitialized = false;
    },

    /**
     * Hot-reload: Replace the underlying adapter
     * @throws Error if another adapter swap is already in progress
     */
    async setAdapter(adapter: AuthAdapter): Promise<void> {
      // Prevent concurrent adapter swaps
      if (isSwapping) {
        throw new Error('Adapter swap already in progress');
      }
      isSwapping = true;

      try {
        const oldAdapter = currentAdapter;

        // Shutdown old adapter
        if (oldAdapter.shutdown) {
          try {
            await oldAdapter.shutdown();
          } catch (err) {
            console.error('[AdapterWrapper] Error shutting down old adapter:', err);
          }
        }

        // Set new adapter
        currentAdapter = adapter;

        // Initialize new adapter if we're already running
        if (isInitialized) {
          // Note: We initialize the new adapter but can't easily swap Express middleware
          // The new adapter's isAuthenticated/getUser will be used immediately
          // Full middleware hot-reload would require server restart
          currentAdapter.initialize();
        }
      } finally {
        isSwapping = false;
      }
    },

    /**
     * Get info about the current adapter
     */
    getAdapterInfo(): { name: string; initialized: boolean } {
      return {
        name: currentAdapter.name,
        initialized: isInitialized,
      };
    },

    /**
     * Check if a real adapter is set (not the no-op)
     */
    hasAdapter(): boolean {
      return currentAdapter.name !== 'none';
    },
  };
}
