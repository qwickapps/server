/**
 * Auth Adapter Wrapper
 *
 * Wraps an auth adapter to enable hot-reload without server restart.
 * All method calls are delegated to the underlying adapter, which can
 * be swapped at runtime via setAdapter().
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { AuthAdapter } from './types.js';
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
    getAdapterInfo(): {
        name: string;
        initialized: boolean;
    };
    /**
     * Check if an adapter is currently set
     */
    hasAdapter(): boolean;
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
export declare function createAdapterWrapper(initialAdapter?: AuthAdapter): AdapterWrapper;
//# sourceMappingURL=adapter-wrapper.d.ts.map