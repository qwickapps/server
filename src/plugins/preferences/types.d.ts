/**
 * Preferences Plugin Types
 *
 * Type definitions for user preferences management.
 * Supports PostgreSQL with Row-Level Security (RLS) for data isolation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Configuration limits for preferences
 */
export declare const MAX_PREFERENCES_SIZE = 100000;
export declare const MAX_NESTING_DEPTH = 10;
/**
 * User preferences record in the database
 */
export interface UserPreferences {
    /** Primary key - UUID */
    id: string;
    /** User ID (foreign key to users table) */
    user_id: string;
    /** Preferences as JSON object */
    preferences: Record<string, unknown>;
    /** When the preferences were created */
    created_at: Date;
    /** When the preferences were last updated */
    updated_at: Date;
}
/**
 * Preferences store interface - all storage backends must implement this
 */
export interface PreferencesStore {
    /** Store name (e.g., 'postgres', 'memory') */
    name: string;
    /**
     * Initialize the store (create tables, RLS policies, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Get preferences for a user
     * Returns null if no preferences exist for the user
     */
    get(userId: string): Promise<Record<string, unknown> | null>;
    /**
     * Update preferences for a user (upsert with deep merge)
     * Returns the merged preferences
     */
    update(userId: string, preferences: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Delete preferences for a user
     * Returns true if preferences were deleted, false if none existed
     */
    delete(userId: string): Promise<boolean>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL preferences store configuration
 */
export interface PostgresPreferencesStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: unknown | (() => unknown);
    /** Table name (default: 'user_preferences') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
    /** Enable RLS (default: true) */
    enableRLS?: boolean;
}
/**
 * Preferences API configuration
 */
export interface PreferencesApiConfig {
    /** API route prefix (default: '/preferences') */
    prefix?: string;
    /** Enable API endpoints (default: true) */
    enabled?: boolean;
}
/**
 * Preferences plugin configuration
 */
export interface PreferencesPluginConfig {
    /** Preferences storage backend */
    store: PreferencesStore;
    /** Default preferences to merge with stored preferences on read */
    defaults?: Record<string, unknown>;
    /** API configuration */
    api?: PreferencesApiConfig;
    /** Enable debug logging */
    debug?: boolean;
}
