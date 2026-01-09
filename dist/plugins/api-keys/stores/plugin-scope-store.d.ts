/**
 * Plugin Scope Store - PostgreSQL Implementation
 *
 * Manages plugin-declared scopes for fine-grained API key authorization.
 * Plugins register their scopes during initialization, which are then available
 * for selection during API key creation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Pool } from 'pg';
/**
 * Plugin scope definition
 */
export interface PluginScope {
    /** Scope name in format 'plugin-id:action' (e.g., 'qwickbrain:execute') */
    name: string;
    /** Plugin ID that declares this scope */
    plugin_id: string;
    /** Human-readable description for UI */
    description: string;
    /** Optional category for grouping (read, write, admin) */
    category?: 'read' | 'write' | 'admin';
    /** When scope was registered */
    created_at?: Date;
    /** When scope was last updated */
    updated_at?: Date;
}
/**
 * Plugin scope store interface
 */
export interface PluginScopeStore {
    /** Store name */
    name: string;
    /**
     * Initialize the store (create tables, indexes, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Register scopes for a plugin (upsert operation)
     * Existing scopes are updated, new scopes are inserted, removed scopes are deleted
     */
    registerScopes(pluginId: string, scopes: Omit<PluginScope, 'plugin_id' | 'created_at' | 'updated_at'>[]): Promise<void>;
    /**
     * Get all scopes for a specific plugin
     */
    getPluginScopes(pluginId: string): Promise<PluginScope[]>;
    /**
     * Get all available scopes across all plugins
     */
    getAllScopes(): Promise<PluginScope[]>;
    /**
     * Verify a scope exists
     */
    isValidScope(scopeName: string): Promise<boolean>;
    /**
     * Delete all scopes for a plugin
     */
    deletePluginScopes(pluginId: string): Promise<void>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL plugin scope store configuration
 */
export interface PostgresPluginScopeStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: Pool | (() => Pool);
    /** Table name (default: 'plugin_scopes') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
}
/**
 * PostgreSQL implementation of PluginScopeStore
 */
export declare function createPostgresPluginScopeStore(config: PostgresPluginScopeStoreConfig): PluginScopeStore;
//# sourceMappingURL=plugin-scope-store.d.ts.map