/**
 * In-memory Tenant Store for Demo/Testing
 *
 * Implements the TenantStore interface with in-memory storage.
 * Pre-populated with demo tenants and memberships.
 */
import type { TenantStore } from '../types.js';
/**
 * Default demo user ID used for pre-populated tenants.
 * Matches the user ID assigned by basic auth guard.
 */
export declare const DEMO_USER_ID = "basic-auth-user";
/**
 * Logger interface for in-memory stores.
 */
export interface InMemoryStoreLogger {
    info: (message: string) => void;
    debug?: (message: string) => void;
}
/**
 * Options for creating an in-memory tenant store.
 */
export interface InMemoryTenantStoreOptions {
    /**
     * Demo user ID for pre-populated tenants.
     * @default 'basic-auth-user'
     */
    demoUserId?: string;
    /**
     * Optional logger for store operations.
     * If not provided, uses console.log as fallback.
     */
    logger?: InMemoryStoreLogger;
}
/**
 * Creates an in-memory tenant store for demo/testing purposes.
 * Pre-populated with 4 demo tenants (organization, group, department, user).
 *
 * This store is NOT suitable for production use - data is lost on restart.
 * Use postgresTenantsStore for production deployments.
 *
 * @param options - Configuration options for the store
 * @returns TenantStore implementation with in-memory storage
 *
 * @example
 * ```typescript
 * import { createInMemoryTenantStore } from '@qwickapps/server';
 *
 * const store = createInMemoryTenantStore({
 *   demoUserId: 'test-user-123',
 *   logger: console,
 * });
 *
 * await store.initialize();
 * const tenants = await store.getTenantsForUser('test-user-123');
 * ```
 */
export declare function createInMemoryTenantStore(options?: InMemoryTenantStoreOptions): TenantStore;
//# sourceMappingURL=in-memory-store.d.ts.map