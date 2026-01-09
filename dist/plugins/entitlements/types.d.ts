/**
 * Entitlements Plugin Types
 *
 * Type definitions for entitlement management.
 * Entitlements are string-based tags (e.g., 'pro', 'enterprise', 'feature:analytics').
 * Sources can be local (PostgreSQL) or remote (Keap, Stripe, etc.).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Entitlement definition - describes an available entitlement
 */
export interface EntitlementDefinition {
    /** Unique ID (UUID for Postgres, tag ID for external sources) */
    id: string;
    /** Display name */
    name: string;
    /** Category for grouping (optional) */
    category?: string;
    /** Description (optional) */
    description?: string;
}
/**
 * Result from entitlement lookup
 */
export interface EntitlementResult {
    /** Identifier used for lookup (email) */
    identifier: string;
    /** Array of entitlement strings (tag names) */
    entitlements: string[];
    /** Source that provided the entitlements */
    source: 'cache' | string;
    /** When the data was cached (ISO string) */
    cachedAt?: string;
    /** When the cache expires (ISO string) */
    expiresAt?: string;
    /** Per-source breakdown (when multiple sources) */
    bySource?: Record<string, string[]>;
    /** Additional metadata from source */
    metadata?: Record<string, unknown>;
}
/**
 * User entitlement record (for writable sources)
 */
export interface UserEntitlement {
    /** Record ID */
    id: string;
    /** User ID (optional, for linking to users table) */
    user_id?: string;
    /** User email (always present) */
    email: string;
    /** Entitlement name/tag */
    entitlement: string;
    /** When granted */
    granted_at: Date;
    /** Who granted it */
    granted_by?: string;
    /** When it expires (null = permanent) */
    expires_at?: Date;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * EntitlementSource interface - adapter pattern for pluggable sources
 *
 * Identifier is typically email, but sources may support other identifiers
 * (e.g., Keap contact ID). The plugin normalizes to email for caching.
 */
export interface EntitlementSource {
    /** Unique source name (e.g., 'postgres', 'keap') */
    name: string;
    /** Human-readable description */
    description?: string;
    /** Whether this source is read-only (no add/remove operations) */
    readonly?: boolean;
    /**
     * Initialize the source (create tables, establish connections, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Get entitlements for an identifier
     * @param identifier Email or other identifier
     * @returns Array of entitlement strings (tag names)
     */
    getEntitlements(identifier: string): Promise<string[]>;
    /**
     * Get all available entitlements that can be assigned
     * Optional - returns empty array if not implemented
     */
    getAllAvailable?(): Promise<EntitlementDefinition[]>;
    /**
     * Search for users with a specific entitlement
     * Optional - for sources that support reverse lookup
     */
    getUsersWithEntitlement?(entitlement: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        emails: string[];
        total: number;
    }>;
    /**
     * Add an entitlement to a user
     * @throws Error if source is read-only
     */
    addEntitlement?(identifier: string, entitlement: string, grantedBy?: string): Promise<void>;
    /**
     * Remove an entitlement from a user
     * @throws Error if source is read-only
     */
    removeEntitlement?(identifier: string, entitlement: string): Promise<void>;
    /**
     * Bulk set entitlements for a user (replaces all existing)
     * Optional - for sources that support batch operations
     */
    setEntitlements?(identifier: string, entitlements: string[]): Promise<void>;
    /**
     * Shutdown the source (close connections, cleanup)
     */
    shutdown(): Promise<void>;
    /**
     * Check if the source is healthy (optional)
     * Used for health checks without making expensive API calls.
     * If not implemented, health check will assume healthy if initialized.
     */
    isHealthy?(): Promise<boolean>;
    /**
     * Get statistics about entitlements (optional)
     * Used for dashboard widgets showing user counts with entitlements.
     */
    getStats?(): Promise<EntitlementStats>;
}
/**
 * Statistics about entitlements from a source
 */
export interface EntitlementStats {
    /** Total users with at least one entitlement */
    usersWithEntitlements: number;
    /** Total number of unique entitlements/tags */
    totalEntitlements?: number;
    /** Additional source-specific stats */
    [key: string]: unknown;
}
/**
 * Entitlement callbacks
 */
export interface EntitlementCallbacks {
    /** Called when entitlements are fetched */
    onFetch?: (identifier: string, entitlements: string[], source: string) => Promise<void>;
    /** Called when entitlements change */
    onChange?: (identifier: string, added: string[], removed: string[]) => Promise<void>;
    /** Called when an entitlement is granted */
    onGrant?: (identifier: string, entitlement: string, grantedBy?: string) => Promise<void>;
    /** Called when an entitlement is revoked */
    onRevoke?: (identifier: string, entitlement: string) => Promise<void>;
}
/**
 * Cache configuration for entitlements
 */
export interface EntitlementsCacheConfig {
    /** Enable caching (default: true) */
    enabled?: boolean;
    /** Cache instance name from cache plugin (default: 'default') */
    instanceName?: string;
    /** Cache key prefix (default: 'entitlements:') */
    keyPrefix?: string;
    /** TTL in seconds for cached entitlements (default: 300) */
    ttl?: number;
    /** TTL for identifier mappings, e.g., contactId -> email (default: ttl * 2) */
    mappingTtl?: number;
}
/**
 * API configuration for entitlements
 */
export interface EntitlementsApiConfig {
    /** API route prefix (default: '/entitlements'). Note: routes are mounted under /api by control panel */
    prefix?: string;
    /** Enable API endpoints (default: true) */
    enabled?: boolean;
    /** Enable write endpoints (grant/revoke) - only works with writable source */
    enableWrite?: boolean;
}
/**
 * Entitlements plugin configuration
 */
export interface EntitlementsPluginConfig {
    /** Primary entitlement source */
    source: EntitlementSource;
    /** Additional sources to query (results are merged) */
    additionalSources?: EntitlementSource[];
    /** Cache configuration */
    cache?: EntitlementsCacheConfig;
    /** Callbacks for entitlement events */
    callbacks?: EntitlementCallbacks;
    /** API configuration */
    api?: EntitlementsApiConfig;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * PostgreSQL entitlement source configuration
 */
export interface PostgresEntitlementSourceConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: unknown | (() => unknown);
    /** User entitlements table name (default: 'user_entitlements') */
    tableName?: string;
    /** Entitlement definitions table (default: 'entitlement_definitions') */
    definitionsTable?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
}
/**
 * Cached entitlements structure (stored in Redis)
 */
export interface CachedEntitlements {
    /** Email (normalized lowercase) */
    email: string;
    /** Combined entitlements from all sources */
    entitlements: string[];
    /** Per-source breakdown */
    bySource: Record<string, string[]>;
    /** When cached (ISO string) */
    cachedAt: string;
    /** When expires (ISO string) */
    expiresAt: string;
    /** Cache version for invalidation */
    version: number;
}
//# sourceMappingURL=types.d.ts.map